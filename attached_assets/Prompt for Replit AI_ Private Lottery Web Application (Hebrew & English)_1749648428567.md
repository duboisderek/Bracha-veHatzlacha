## Prompt for Replit AI: Private Lottery Web Application (Hebrew & English)

**Goal:** Develop a full-stack, bilingual (Hebrew and English) private lottery web application with a modern UI, comprehensive management logic, and clear navigation, based on the detailed specifications provided below.

**Application Name:** Private Lottery (or a suitable, creative name in both Hebrew and English that Replit AI can suggest).

**Languages:** The entire application, including all UI elements, content, and user-facing messages, must be fully localized and switchable between Hebrew and English.

**Technical Stack:**
*   **Frontend:** React (or a modern equivalent like Next.js if it better supports bilingualism and performance).
*   **Backend:** Python Flask (preferred) or Node.js.
*   **Styling:** Tailwind CSS for a modern, clean, and responsive design. If Tailwind CSS is not feasible, propose an alternative modern CSS framework that ensures a visually appealing and clear interface.
*   **Database:** A simple, file-based database (e.g., SQLite) or a lightweight NoSQL database (e.g., MongoDB) for ease of setup and scalability within Replit. The choice should be justified by Replit AI.

**Architecture & Code Organization:**
*   **Scalability:** The architecture should be designed for future scalability, allowing for easy addition of new features and increased user load.
*   **Modularity:** Code should be organized logically by components, pages, and functions.
*   **Separation of Concerns:** Clear separation of responsibilities (e.g., authentication, database interactions, lottery game logic, user management, admin functionalities).
*   **Configuration:** Include a dedicated configuration file (e.g., `config.js` for Node.js or `config.py` for Flask) for general lottery parameters (e.g., draw frequency, jackpot update interval, user rank thresholds).

**Functional Requirements:**

### Frontend - User Interface (UI)

#### Main Screens:

1.  **Home Screen:**
    *   **Lottery Participation:** Intuitive input fields for users to select their lottery numbers and specify their participation amount.
    *   **Next Draw Information:** Prominent display of the exact date and time of the next lottery draw.
    *   **Standard Lottery Suggestion:** A clear link or call-to-action suggesting participation in an additional standard lottery, encouraging further engagement.
    *   **Re-use Numbers:** An option allowing users to easily re-use numbers from their previous lottery participations.

2.  **Personal Area (Dashboard):**
    *   **Account Balance:** Real-time display of the user's current account balance.
    *   **Top-up History:** A detailed log of all past account top-ups.
    *   **User Status/Rank:** Dynamic display of the user's current status (e.g., 'New', 'Active', 'Veteran', 'VIP'), which should update automatically based on their participation level.

3.  **Chat/Support Screen:**
    *   **Live Chat:** A functional interface for direct, real-time conversation with a support representative.
    *   **Support Request:** An option to formally open a new support request, allowing users to detail their issues.

#### General Features (UI/UX):

*   **Automatic Notifications (Simulated):**
    *   **Draw Imminent:** A notification system (simulated via web interface or a placeholder for SMS) to alert participants when a draw is about to start.
    *   **Winning Notification:** A notification (simulated via web interface or a placeholder for SMS) to inform winners, displaying the prize amount and guiding them on how to claim their winnings.
*   **Referral Program:**
    *   **Link/QR Code Generation:** Functionality for users to generate a unique personal referral link or QR code.
    *   **Bonus System:** Implementation of a bonus system where the referrer receives ₪100 when their invited friend makes a first-time top-up of ₪1000 or more.
*   **Jackpot Display:**
    *   **Dynamic Update:** The current jackpot amount should be prominently displayed on the Home Screen and update automatically every few hours.
    *   **Last Update Timestamp:** Display the date and time of the last jackpot update.
*   **Automatic Participation Lock:**
    *   The system must automatically prevent new participations 60 seconds before a draw commences.
*   **Winners Carousel:**
    *   A visually engaging carousel at the top of the screen, rotating to display the names and winning amounts of recent winners.
*   **Quick Contact Widgets:**
    *   Easily accessible widgets or buttons for WhatsApp, Telegram, and the in-app chat, available from every page of the application.
*   **Dynamic Design & Animations:**
    *   Incorporate engaging animations (e.g., falling coins, gold and silver effects) to enhance the user experience.
    *   Utilize eye-catching and vivid colors to create an attractive and lively interface.

### Backend - Core Logic & Admin Panel

#### Core Logic:

*   **User Management:**
    *   **User Creation:** Backend logic to create new user accounts using only a username.
    *   **Account Top-ups:** Functionality for manual top-ups of user accounts.
    *   **User Blocking:** Mechanisms for temporarily or permanently blocking user accounts.
*   **Lottery Logic:**
    *   Comprehensive management of lottery draws, including draw scheduling and execution.
    *   Processing and validation of user participations (number selections, amounts).
    *   Accurate determination of winners and automated distribution of prizes.
*   **User Status Management:**
    *   Automated system for assigning user ranks based on their total number of lottery participations:
        *   **Silver:** 10 participations
        *   **Gold:** 100 participations
        *   **Diamond:** 500 participations
*   **Referral System Logic:**
    *   Backend logic to track referrals, validate conditions for bonuses, and apply them to user accounts.
*   **Notification System:**
    *   Backend triggers for sending simulated SMS or web notifications based on lottery events.
*   **Jackpot Update Mechanism:**
    *   Logic to periodically update the jackpot amount and store the last update timestamp.

#### Admin Panel:

*   **User Creation:** Interface for administrators to create new users by entering only a username.
*   **Manual Top-ups:** Functionality for administrators to manually add funds to user accounts.
*   **Winners History:** A comprehensive view of winners for each draw, including their details and winning amounts.
*   **User Management:** Tools for administrators to temporarily or permanently block users.

**Deliverables:**

Replit AI should generate the foundational project structure, including:
*   Frontend (React) project setup with basic components for each main screen.
*   Backend (Flask/Node.js) project setup with basic API endpoints for core functionalities.
*   Database integration setup.
*   Initial configuration file.
*   Placeholder files for bilingual content (Hebrew and English).
*   Basic styling with Tailwind CSS (or chosen alternative).
*   A `README.md` file explaining the project structure, how to run the application, and key considerations for further development.

**Important Considerations for Replit AI:**
*   Prioritize clean, readable, and well-commented code.
*   Ensure the application is responsive and works well on both desktop and mobile devices.
*   Focus on security best practices for user data and transactions.
*   Provide clear instructions on how to extend and deploy the application.
*   For any dynamic content or animations, provide examples or clear guidance on implementation.

This prompt aims to guide Replit AI in generating a robust and functional starting point for the private lottery web application, adhering to all specified requirements.

