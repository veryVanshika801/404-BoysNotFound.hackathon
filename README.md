<img width="1600" height="800" alt="image" src="https://github.com/user-attachments/assets/920bc30c-1194-4237-b6af-55ebedf12cbd" />

## 1. Chosen Problem Statement

**Problem Statement 2: Vernacular Medicine and Dose Companion**

People may miss medicine doses, confuse similar-looking pills, or misunderstand dosage instructions because medicine packaging and instructions are often printed in small English text. This can be especially challenging for senior citizens living alone and parents managing medicine schedules for several children.

MAATRA aims to make a prescribed routine easier to follow by letting users set up medicine reminders with visual cues—such as pill colour, pill shape, and dosage icons—and receive spoken reminders in a language they understand. The goal is to reduce dependence on reading English when following an existing prescription.

## 2. Team Members

Replace the placeholders below with the exact names and USNs of every team member before submission.

USN | Team number name

2392608015 Seemakurthi Koushitha

2392608074 Vanshika

2392608143  Syed Shaguftah Mahnoor

2392608119 Siddhika K

2392608282 Dipanshi Singh 

2392608056 Pooja Chandrakar

💊 About the WebApp

A simple, visual medication assistant designed to make taking medicines safer and easier. Users can set up their medication routine using pill colours, shapes, dosage icons, and visual cues instead of relying on small English text. The app also provides spoken reminders in the user’s preferred language, helping senior citizens and parents manage medicines with less confusion and fewer missed doses.

# Full App Flow Inshort
1. Set Up Profile – User selects their preferred language and adds their medication details.
2. Add Medicine – Selects the pill’s colour, shape, dosage, and timing using simple visual options.
3. Create Routine – Medicines are organized into a clear daily medication schedule.
4. Get Reminders – The app sends timely visual and spoken alerts in the user’s chosen language.
5. Track Medication – Users can mark medicines as taken and monitor their daily routine.


# Demo Credentials
Prototype: https://404-boys-not-found-hackathon.vercel.app/

# Features Implemented
1. User Profile Setup – Set up basic user details and preferred language.
2. Multilingual Support – Use the app in the user’s preferred language.
3. Medicine Addition – Add medicines with name, dosage, and schedule.
4. Visual Medicine Identification – Identify pills using colour and shape.
5. Visual Dosage Icons – Simple icons make dosage instructions easier to understand.
6. Medication Routine – Create and organize daily medicine schedules.
7. Smart Reminders – Receive reminders at scheduled medication times.
8. Spoken Alerts – Get medication reminders through voice alerts in the selected language.
9. Dose Tracking – Mark medicines as taken and keep track of completed doses.
10. Simple Accessibility-Focused UI – Designed with clear visuals and minimal text for easier navigation.

# Why We Approached This Problem
We chose this problem because medication should be easy to understand, regardless of age or language. Small English text on medicine packaging can create confusion, especially for senior citizens and people managing medicines for multiple family members.
Our approach was to replace text-heavy instructions with simple visual cues like pill colour, shape, dosage icons, and timings. We also added voice-based reminders in the user’s preferred language, making the routine easier to follow.
Our goal was to build a solution that is simple, accessible, and practical—reducing missed doses and confusion without making users depend on reading complex instructions.


# How We Approached the Problem
We started by focusing on the main challenge: medication instructions are often difficult to understand, especially for senior citizens and people who are not comfortable reading English. We wanted to move away from complicated text-based instructions and create a more visual and easy-to-follow experience.

We designed the app around simple visual elements such as pill colour, shape, dosage icons, and clear medication timings. Users can create their own medication routine step by step, making it easier to identify the right medicine and understand when it needs to be taken without depending completely on written instructions.

To make the solution more accessible, we added multilingual spoken reminders so users can hear their medication alerts in their preferred language. We also included dose tracking to help users keep up with their routine. Overall, our approach was to make medication management simple, visual, accessible, and less dependent on English.

# Trade-offs We Made
- Simplicity over complexity: Focused on essential medication features instead of adding unnecessary ones.
- Visuals over text: Used pill colours, shapes, and icons to make instructions easier to understand.
- Accessibility over convenience: Prioritized multilingual voice reminders over text-only notifications.
- Core experience over advanced features: Focused on building a reliable medication routine within the available development time.

# App Architecture
<img width="1312" height="1199" alt="image" src="https://github.com/user-attachments/assets/fdf2c0e7-c3e2-409a-bd2e-87df59c8b527" />

# Flow Summary
1.User Setup – User creates a profile and selects their preferred language.
2.Add Medicine – User enters the medicine name, dosage, and timing.
3.Visual Identification – User selects the pill’s shape and colour for easy recognition.
4.Create Routine – Medicines are organized into a simple daily schedule.
5.Set Reminders – The system stores the medication timings and reminder preferences.
6.Language Processing – The selected language is used to prepare the reminder message.
7.Voice Generation – The AI Voice API converts the reminder into spoken audio.
8.Alert Scheduling – Background jobs check upcoming doses and trigger reminders on time.
9.Spoken Notification – The user receives a voice alert in their chosen language along with visual cues.
10.Dose Tracking – The user marks the medicine as taken, helping track adherence and notify caregivers when needed.

# Tech Stack
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/b60686dc-9a0c-4fda-8129-d2c42b4cf036" />

# Component Interaction Flow
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/31f102bd-3d3f-41d0-8daf-9fc5445719fd" />

# Frontend Backend Architecture Flow
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/71b36b0e-fdc5-4e44-8ed9-5ba2b53e0da0" />


# Project Structure
<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/5c177b3d-c906-46f6-9bd9-cf0daf686166" />

# Deployment
<img width="1224" height="1285" alt="image" src="https://github.com/user-attachments/assets/b40c4b06-2cfb-47a6-9940-5132ac040be7" />
