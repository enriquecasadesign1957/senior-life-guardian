import process from "node:process";
function isDemoMode() {
  if (typeof process !== "undefined" && process.env.DEMO_MODE === "true") return true;
  return false;
}
function isPresentationMode() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("seniorsafe_demo_presentation") === "1";
}
function setPresentationMode(enabled) {
  if (typeof window === "undefined") return;
  if (enabled) sessionStorage.setItem("seniorsafe_demo_presentation", "1");
  else sessionStorage.removeItem("seniorsafe_demo_presentation");
}
export {
  isPresentationMode as a,
  isDemoMode as i,
  setPresentationMode as s
};
