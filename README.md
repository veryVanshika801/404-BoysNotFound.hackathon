# MAATRA — Vernacular Medicine & Dose Companion

**Tagline:** Every Dose, In Your Voice.

MAATRA is a medicine-reminder prototype designed to help people follow their prescribed medicine schedules through clear visual information and spoken reminders in their preferred language.

> **Project status:** Prototype / work in progress. This README distinguishes the intended features from features that are actually implemented. Update the status after testing your current code.

## 1. Chosen Problem Statement

**Problem Statement 2: Vernacular Medicine and Dose Companion**

People may miss medicine doses, confuse similar-looking pills, or misunderstand dosage instructions because medicine packaging and instructions are often printed in small English text. This can be especially challenging for senior citizens living alone and parents managing medicine schedules for several children.

MAATRA aims to make a prescribed routine easier to follow by letting users set up medicine reminders with visual cues—such as pill colour, pill shape, and dosage icons—and receive spoken reminders in a language they understand. The goal is to reduce dependence on reading English when following an existing prescription.

## 2. Team Members

Replace the placeholders below with the exact names and USNs of every team member before submission.

| No. | Team member name | USN |
|---|---|---|
| 1 | [Team Member 1] | [USN] |
| 2 | [Team Member 2] | [USN] |
| 3 | [Team Member 3] | [USN] |
| 4 | [Team Member 4] | [USN] |
| 5 | [Team Member 5] | [USN] |

*Remove unused rows and check that all names and USNs are accurate.*
## 3. What We Are Building

We are building a simple, accessible web prototype that helps a user create and follow a medicine reminder routine.

The planned user flow is:

1. **Choose a language** — select a preferred language from the languages supported by the prototype.
2. **Add medicine details** — enter the medicine name and the schedule exactly as provided by the prescription or a caregiver.
3. **Set a schedule** — select reminder times and enter the prescribed instructions without changing them.
4. **Receive a voice reminder** — hear a spoken reminder in the selected language when the browser and device support it.
5. **Confirm the dose** — mark the reminder as taken to keep track of the routine.

### Why MAATRA?

- **Language accessibility:** spoken reminders can help users who find written English difficult.
- **Visual support:** simple labels and icons can make schedules easier to understand.
- **Routine support:** scheduled reminders can help users remember planned doses.
- **Caregiver-friendly concept:** a clear schedule may help families organise reminders for people they support.
- **Simple first version:** a web prototype lets us test the core experience before adding more complex services.

MAATRA is intended to support an existing prescription—not to diagnose conditions, recommend medicines, change prescriptions, or calculate doses.

## 4. Features and Current Status

Update this table to reflect what works in the code you are submitting. Do not mark a feature as complete until you have tested it.
| Feature | Purpose | Status |
|---|---|---|
| Responsive web interface | Make the prototype usable on different screen sizes | Planned / verify |
| Language selection | Let users choose a preferred language | Planned / verify |
| Medicine schedule form | Enter medicine details and prescribed reminder times | Planned / verify |
| Visual cues | Use labels/icons for medicine and schedule information | Planned / verify |
| Browser voice reminders | Speak reminder text where browser speech support is available | Planned / verify |
| Save schedules locally | Keep reminder data on the device for a prototype | Planned / verify |
| Mark reminder as taken | Let users record that they have acknowledged a reminder | Planned / verify |
| Backend / user accounts | Support accounts or shared data if needed | Optional / not assumed complete |
| Translation service | Translate reminder text into additional languages | Optional / requires validation |

## 5. Technology Stack

The planned stack is intentionally lightweight so the first prototype can be built and tested quickly.

- **Frontend:** HTML, CSS, and JavaScript for the interface and user interactions.
- **Voice reminders:** Browser Speech API / text-to-speech, where supported by the browser and device.
- **Data storage:** browser local storage for a basic local prototype; SQLite may be used if a backend is added.
- **Optional backend:** Python Flask for account or API features, if required.
- **Optional translation:** a translation API or reviewed translations. Medicine names and medical instructions must be checked carefully before use.

The optional backend and translation service are not required for a basic static prototype. The final stack should match the code actually included in the repository.

## 6. Installation and Run Instructions

### Requirements

- A modern web browser such as Chrome, Edge, or Firefox.
- The project files downloaded or cloned to your computer.
- If the project uses only HTML, CSS, and JavaScript, no package installation is required.
- ### Option A — Run a static frontend

1. Clone or download this repository.
2. Open the project folder.
3. Locate `index.html`.
4. Open `index.html` in a modern browser.

If the project uses browser features that work more reliably through a local web server, run one from the project folder:

**Python**
```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

If your main HTML file is in a subfolder, start the server from that folder instead.

### Option B — If a Flask backend has been implemented

Use this section only if the repository actually contains a Flask backend and a `requirements.txt` file.

```bash
python -m venv .venv
```

Activate the environment:

**Windows**
```bash
.venv\Scripts\activate
```

**macOS / Linux**
```bash
source .venv/bin/activate
```

Install dependencies and start the application:

```bash
pip install -r requirements.txt
python app.py
```

The exact start command may differ depending on the backend entry file. Follow the actual project files and update these instructions before submission.

### Browser voice reminder notes

- Speech synthesis support and available voices vary by browser, device, and language.
- Some browsers require the user to interact with the page before audio can play.
- Test voice reminders on the devices and languages you intend to demonstrate.
- Do not assume that a reminder will sound if the browser is closed, the device is muted, or notifications/audio are blocked.

## 7. How to Use the Prototype

1. Open MAATRA in a supported browser.
2. Choose a language that has been verified in testing.
3. Enter the medicine information and timing exactly as written on the existing prescription or provided by a qualified healthcare professional.
4. Save the schedule if local saving is implemented.
5. Allow or enable sound if the browser requests it.
6. Check that the reminder is spoken correctly.
7. Use the confirmation control to mark the reminder as taken, if this feature is implemented.

For demonstrations, use fictional sample medicine data. Do not upload or display real patient information without appropriate permission and safeguards.

## 8. Workflow

**Language selection → Medicine details → Schedule → Voice alert → Confirmation**

- **Language:** choose a supported preferred language.
- **Medicine details:** enter the prescribed information.
- **Schedule:** set the reminder time according to the existing prescription.
- **Voice alert:** hear the reminder where speech support is available.
- **Confirmation:** record whether the reminder was acknowledged.

## 9. Safety, Privacy, and Limitations

- MAATRA is a reminder aid, not a medical decision-making system.
- It does not diagnose, prescribe, recommend a medicine, or calculate or modify a dose.
- Users should follow the prescription and consult a qualified healthcare professional if instructions are unclear.
- Visual appearance alone cannot reliably identify a pill. Users must verify medicine details against the original packaging or with a pharmacist/healthcare professional.
- Translation may be inaccurate. Medical wording, medicine names, and instructions require careful review.
- Voice support varies by device, browser, permissions, and available language voices.
- A browser-only prototype may not deliver reliable reminders when the page is closed or the device is offline.
- Local browser storage is not a secure shared medical record and may be cleared by the browser or device.
- Do not store unnecessary personal or health information in a demo.
- Use fictional sample data for public demonstrations.

## 10. Honest Unfinished Features

Complete this section before submission. Keep only the items that are still unfinished.

- [ ] Language selection has been tested with every language shown in the interface.
- [ ] Spoken reminders have been tested on the demonstration device.
- [ ] Reminder scheduling has been tested for the required times and edge cases.
- [ ] Saved schedules remain available after refreshing or reopening the page.
- [ ] The “mark as taken” action updates the displayed schedule correctly.
- [ ] Translation has been reviewed by a competent speaker; medical wording has been checked.
- [ ] Backend, accounts, and database features are implemented and tested, if included in the claimed scope.
- [ ] Accessibility checks have been completed, including readable text, keyboard navigation, and clear controls.
- [ ] Installation instructions have been verified on a clean setup.

**Known limitations in the current build:**  
[Write the limitations you personally observed while testing. Do not claim that a feature works unless you verified it.]

## 11. Future Improvements

- Add larger text, high-contrast controls, and a simpler senior-friendly interface.
- Support caregiver-assisted schedule setup with appropriate privacy controls.
- Improve reminder reliability and explain when alerts may not work.
- Add carefully reviewed language options.
- Add secure accounts or synchronisation only if needed and properly protected.
- Conduct usability testing with consent and feedback from intended users.

## 12. Demo Checklist

Before presenting:

- [ ] Confirm the problem statement and team member details.
- [ ] Run the application from the instructions above.
- [ ] Demonstrate the language-selection flow.
- [ ] Add a fictional medicine schedule.
- [ ] Demonstrate a voice reminder in a tested language.
- [ ] Demonstrate confirmation / “mark as taken” if implemented.
- [ ] Explain which features are complete, partial, or planned.
- [ ] Mention safety limitations and use only sample data.

## 13. Project Details

- **Project name:** MAATRA
- **Problem statement:** 2 — Vernacular Medicine and Dose Companion
- **Tagline:** Every Dose, In Your Voice.
- **Project type:** Web prototype
- **Development status:** Work in progress; update based on the submitted build.
