# tennis-bot

Reserveert elke week automatisch een tennisbaan zodra deze precies 7 dagen van
tevoren vrijkomt, met een dashboard om de instellingen te wijzigen en de
geschiedenis te bekijken. Bij deze vereniging kan reserveren **alleen via de
KNLTB ClubApp**, niet via de website — de bot roept daarom rechtstreeks de
achterliggende API van de app aan (gereverse-engineerd via het netwerkverkeer
van de app), in plaats van een browser te automatiseren.

## Architectuur

```
backend/     NestJS + Prisma — API, boekingslogica/scheduler, serveert ook de frontend
frontend/    React + TypeScript (Vite) dashboard
docker-compose.yml   Postgres + de app, in twee containers
Dockerfile           multi-stage build: frontend -> backend -> runtime image
```

- `backend/src/booking/booking-scheduler.service.ts` — draait continu, rekent
  precies uit wanneer het doelmoment is (tijdzone/zomertijd via `luxon`) en
  wacht daar tot op ~50ms nauwkeurig op. Herleest de instellingen elke cyclus
  uit de database, zodat een wijziging via het dashboard binnen het uur wordt
  opgepikt.
- `backend/src/booking/booking-runner.service.ts` — de eigenlijke boekpoging:
  beschikbaarheid ophalen, valideren, boeken. Schrijft elke poging weg als
  `BookingAttempt` in Postgres (vervangt de oude `logs/*.json`-bestanden).
- `backend/src/knltb/knltb-api.service.ts` — praat rechtstreeks met
  `api.knltb.club` via `fetch`, geen browser nodig. Een `FakeKnltbApiService`
  (aan via `MOCK_KNLTB=true`) simuleert dezelfde API voor lokaal testen zonder
  het echte account te raken.
- `frontend/` — status (volgende poging/laatste resultaat), instellingenformulier
  (dag/tijd/baanvoorkeur/medespelers), boekingsgeschiedenis, en een
  dry-run/echt-boeken-knop. Geen login (persoonlijk gebruik).

### De KNLTB-API

Omdat er geen publieke documentatie is, is de API gevonden door het
netwerkverkeer van de KNLTB ClubApp te onderscheppen (mitmproxy, met
certificate-pinning omzeild via Frida/objection op een gerootte
Android-emulator). Belangrijkste endpoints:

| Actie | Endpoint |
|---|---|
| Inloggen | `POST /v1/pub/tennis/clubs/{club_id}/auth_tokens` (body: `federation_membership_number` + `password`) |
| Uitloggen | `DELETE /v1/pub/tennis/clubs/{club_id}/auth_tokens/{token}` |
| Beschikbaarheid | `GET /v1/pub/tennis/clubs/{club_id}/availability_timeline?time_from=...` |
| Valideren | `POST /v1/pub/tennis/clubs/{club_id}/reservations/validate` |
| Boeken | `POST /v1/pub/tennis/clubs/{club_id}/reservations` |

Elke request gebruikt daarnaast een vaste, app-brede `Authorization: Basic ...`
header (ingebakken in de APK, niet gebonden aan één account) plus de
`x-lisa-auth-token` die je bij het inloggen terugkrijgt. Zonder
`User-Agent: okhttp/4.9.3` geeft Cloudflare een 403.

**Let op**: deze vereniging vereist minimaal 2 spelers per boeking — een
reservering met alleen de hoofdaccount wordt geweigerd (HTTP 422, "niet genoeg
spelers"). Vandaar `partnerMemberIds` in de instellingen.

**Let op #2**: er geldt een anti-misbruik rate limit van **1 echte boeking per
240 minuten** per account. De validate-call (en dus de "dry run"-knop op het
dashboard) valt hier niet onder — alleen het daadwerkelijk aanmaken van een
reservering.

## Lokaal draaien

Vereist Docker + Docker Compose.

```bash
cp .env.example .env
# vul .env in: POSTGRES_PASSWORD, KNLTB_*, PARTNER_MEMBER_IDS, TARGET_*, etc.
# zet MOCK_KNLTB=true om zonder het echte account te testen
docker compose up -d --build
```

Dashboard + API op `http://localhost/`. Instellingen worden bij de eerste
opstart eenmalig geseed vanuit `.env`; daarna is de database de bron van
waarheid en wijzig je alles via het dashboard.

Voor puur backend-ontwikkeling (zonder Docker): `cd backend && npm run
start:dev` (vereist een lokale Postgres, `DATABASE_URL` in `backend/.env`).
Voor frontend-ontwikkeling: `cd frontend && npm run dev` (proxyt `/api` naar
`localhost:3010`, zie `vite.config.ts`).

### Testen zonder het echte account te raken

- `MOCK_KNLTB=true` schakelt de `FakeKnltbApiService` in: simuleert altijd een
  vrije baan, valideert en "boekt" zonder de echte KNLTB-API aan te roepen.
- Unit tests: `cd backend && npx jest`
- Tegen de échte API: alleen de dry-run-knop (of `POST /api/booking/run-now`
  met `{"dryRun": true}`) is veilig — die roept login/beschikbaarheid/valideren
  aan maar boekt nooit echt, en valt niet onder de 240-minuten-limiet.

## Deployen op een always-on server

Geen GitHub Actions cron of soortgelijke cloud-cron hiervoor gebruiken: die
hebben doorgaans minuten aan vertraging, en banen zijn vaak binnen seconden
weg. De scheduler is bewust een **continu draaiend proces** dat zelf tot op
tientallen milliseconden nauwkeurig wacht — dat werkt alleen op iets dat 24/7
aanstaat (bijv. een kleine Hetzner/DigitalOcean-VPS).

```bash
docker compose up -d --build
```

Logs: `docker compose logs -f app`

## Verificatie

- `GET /api/status` — volgende geplande poging + laatste resultaat
- `GET /api/reservations` — geschiedenis van alle pogingen (geslaagd/mislukt,
  welke baan, foutmelding indien van toepassing)
