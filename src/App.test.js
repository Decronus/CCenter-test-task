import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import App from "./App";

Object.defineProperty(window, "matchMedia", {
    value: () => {
        return {
            matches: false,
            addListener: () => {},
            removeListener: () => {},
        };
    },
});

test("Check initial state", () => {
    render(<App />);
    expect(screen.getByTestId("search")).toHaveValue("John");
});

test("Check search input existing in document", () => {
    render(<App />);
    const search = screen.getByTestId("search");
    expect(search).toBeInTheDocument();
});

test("Check search sort radio existing in document", () => {
    render(<App />);
    const sortRadio = screen.getByTestId("sortRadio");
    expect(sortRadio).toBeInTheDocument();
});

test("Check search input value change", async () => {
    render(<App />);
    const searchInput = screen.getByTestId("search");
    fireEvent.change(searchInput, { target: { value: "Kate" } });
    expect(searchInput).toHaveValue("Kate");
});
