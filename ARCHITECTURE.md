# System Architecture

This document outlines the core architectural patterns and flows used in the Loan Application Wizard.

## 1. The Wizard Pattern
The application uses a state-driven Wizard pattern to handle the multi-step form.
- **Controller (`App.jsx`):** Acts as the central orchestrator, maintaining the `currentStep` index in the local component state or global store.
- **Step Components:** Each of the 8 steps (e.g., `Step1PersonalInfo`, `Step7Documents`) is an isolated React component. They only render when their respective index matches the active step in the Controller.
- **Validation Checkpoint:** Moving to the "next" step is guarded by a validation check. The user cannot proceed unless the current step's form fields are valid according to its schema.

## 2. Schema Factory
To manage complex, dynamic validation rules, we utilize a Schema Factory pattern with **Zod**.
- **Dynamic Rules:** Instead of static schemas, functions return Zod schemas based on the current state (e.g., if the user selects "Employed", the factory generates a schema that makes employer details mandatory).
- **Separation of Concerns:** Validation logic is decoupled from UI components. Components simply call the factory function to get the appropriate schema for their current render cycle.
- **Resolver Integration:** The dynamically generated schema is passed directly to React Hook Form's `zodResolver`.

## 3. Auto-Save Flow
To prevent data loss, the application implements a robust auto-save mechanism using **Zustand** and `localStorage`.
- **Global Store (`store/loanStore.js`):** Zustand serves as the single source of truth for the entire application's data state.
- **Persistence Middleware:** Zustand's `persist` middleware automatically syncs the store's state to the browser's `localStorage` every time an update occurs.
- **Hydration:** On initial page load, Zustand hydrates the store with any existing data found in `localStorage`, allowing users to resume their application exactly where they left off.
- **Syncing:** As the user types in a React Hook Form step, or upon moving to the next step, the form data is dispatched to update the Zustand store.

## 4. Cross-Step Dependency Management
Many steps in the application depend on answers provided in previous steps.
- **Centralized Data Access:** Because all step data is synced to the Zustand store, any step can effortlessly read the answers from previous steps.
- **Conditional Rendering:** Steps use data from the store to conditionally render fields (e.g., showing a "Spouse Income" field only if Step 1 marked marital status as "Married").
- **Dynamic Validation (via Schema Factory):** The Schema Factory reads the Zustand store state to dynamically alter validation requirements (e.g., enforcing a higher minimum income requirement if a massive loan amount was requested in Step 2).
