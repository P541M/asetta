import { describe, expect, it } from "vitest";
import { passwordCriteria } from "./passwordCriteria";

describe("passwordCriteria", () => {
  const nothingMet = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  };

  it("meets nothing for an empty password", () => {
    expect(passwordCriteria("")).toEqual(nothingMet);
  });

  it("meets every rule for a strong password", () => {
    expect(Object.values(passwordCriteria("Abcdefg1!")).every(Boolean)).toBe(true);
  });

  it("needs at least 8 characters", () => {
    expect(passwordCriteria("1234567").minLength).toBe(false);
    expect(passwordCriteria("12345678").minLength).toBe(true);
  });

  it.each([
    ["an uppercase letter", "A", "hasUppercase"],
    ["a lowercase letter", "a", "hasLowercase"],
    ["a number", "7", "hasNumber"],
    ["a special character", "!", "hasSpecialChar"],
  ])("reads %s on its own", (_case, password, rule) => {
    expect(passwordCriteria(password)).toEqual({ ...nothingMet, [rule]: true });
  });

  it.each([...'!@#$%^&*(),.?":{}|<>'])("counts %s as a special character", (character) => {
    expect(passwordCriteria(character).hasSpecialChar).toBe(true);
  });

  it.each([["-"], ["_"], ["+"], ["="], ["/"], ["["], [" "]])(
    "doesn't count %j as a special character",
    (character) => {
      expect(passwordCriteria(character).hasSpecialChar).toBe(false);
    },
  );

  it("counts only unaccented letters as upper or lower case", () => {
    expect(passwordCriteria("É").hasUppercase).toBe(false);
    expect(passwordCriteria("é").hasLowercase).toBe(false);
  });
});
