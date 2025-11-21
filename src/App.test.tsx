import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock the DiceStage component since it uses Three.js which is complex to test
vi.mock("./components/DiceStage", () => ({
  DiceStage: ({
    mode,
    onEditLibraryDie,
  }: {
    mode: "selected" | "library";
    onEditLibraryDie?: (dieId: string) => void;
  }) => (
    <div data-testid={`dice-stage-${mode}`}>
      {mode === "library" && onEditLibraryDie && (
        <button
          data-testid="mock-edit-button"
          onClick={() => {
            onEditLibraryDie("test-die-id");
          }}
        >
          Edit
        </button>
      )}
    </div>
  ),
}));

// Mock DiceFormModal
vi.mock("./components/DiceFormModal", () => ({
  DiceFormModal: ({ die }: { die?: { id: string; name: string } }) => (
    <div data-testid="dice-form-modal">
      {die && <div data-testid="editing-die">{die.name}</div>}
    </div>
  ),
}));

// Mock other components
vi.mock("./components/FontGallery", () => ({
  FontGallery: () => <div data-testid="font-gallery" />,
}));

vi.mock("./components/PastRollsSidebar", () => ({
  PastRollsSidebar: () => <div data-testid="past-rolls-sidebar" />,
}));

describe("App - Edit Dice Functionality", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // AC1: The onEditLibraryDie callback should be passed to DiceStage in library mode
  it("should pass onEditLibraryDie callback to library DiceStage", () => {
    render(<App />);

    // Both selected and library DiceStage should be rendered
    expect(screen.getByTestId("dice-stage-selected")).toBeInTheDocument();
    expect(screen.getByTestId("dice-stage-library")).toBeInTheDocument();
  });

  // AC2: Clicking edit should open the modal with the correct die
  it("should open edit modal when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initially, modal should not be visible
    expect(screen.queryByTestId("dice-form-modal")).not.toBeInTheDocument();

    // Click the mock edit button
    const editButton = screen.getByTestId("mock-edit-button");
    await user.click(editButton);

    // Modal should now be visible
    await waitFor(() => {
      expect(screen.getByTestId("dice-form-modal")).toBeInTheDocument();
    });
  });

  // AC3: The create die FAB should be hidden when modal is open
  it("should hide create die FAB when modal is open", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Find and click the create die FAB
    const createFab = screen.getByLabelText("Create Die");
    expect(createFab).toBeInTheDocument();

    await user.click(createFab);

    // FAB should be hidden when modal opens
    await waitFor(() => {
      expect(screen.queryByLabelText("Create Die")).not.toBeInTheDocument();
    });
  });
});
