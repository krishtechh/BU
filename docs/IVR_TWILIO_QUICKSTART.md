# Twilio IVR Quickstart (Fast Setup)

## What is implemented

- `POST /api/ivr/twilio/incoming`: language selection (English/Hindi)
- `POST /api/ivr/twilio/language`: category DTMF menu
- `POST /api/ivr/twilio/category`: speech capture for issue description
- `POST /api/ivr/twilio/finalize`: Gemini extraction -> creates report -> sends SMS -> reads ticket number
- `GET /api/ivr/health`: health endpoint
- Optional Twilio webhook signature verification middleware

## Twilio Console setup

1. Buy/activate a Twilio Voice number (trial is fine for demo).
2. In Twilio Phone Number config:
   - Voice webhook URL: `https://<your-public-backend>/api/ivr/twilio/incoming`
   - Method: `HTTP POST`
3. If running locally, expose backend with ngrok:
   - `ngrok http 5000`
   - Use the HTTPS URL in Twilio webhook field.

## Required env defaults

Set these in `civic-backend/.env`:

```env
IVR_DEFAULT_CITY=Delhi
IVR_DEFAULT_STATE=Delhi
IVR_DEFAULT_LATITUDE=28.6139
IVR_DEFAULT_LONGITUDE=77.2090
IVR_PUBLIC_BASE_URL=https://your-ngrok-or-domain
IVR_VALIDATE_TWILIO_SIGNATURE=false
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_SMS_FROM=+1XXXXXXXXXX
GEMINI_API_KEY=your-gemini-api-key
IVR_GEMINI_MODEL=gemini-2.0-flash
```

Notes:
- During first setup keep `IVR_VALIDATE_TWILIO_SIGNATURE=false`.
- After `IVR_PUBLIC_BASE_URL` is stable and correct, change to `true`.
- `TWILIO_SMS_FROM` must be an SMS-capable Twilio number.

## How ticket creation works

- Caller number is used to find/create a citizen user.
- Speech transcript (`SpeechResult`) is sent to Gemini for JSON extraction.
- Gemini can refine category/priority/description/address hint.
- Report is inserted with `status=submitted` and a status-history entry.
- SMS confirmation is attempted through Twilio REST API.
- System speaks ticket ID (first 8 chars of report UUID).

## Demo test checklist

1. Start backend.
2. Call Twilio number from a verified phone (trial restriction).
3. Press language digit.
4. Press issue category digit.
5. Speak issue and location.
6. Verify new row in `Report` table and `ReportStatusHistory`.
7. Verify SMS delivery in Twilio console logs.
