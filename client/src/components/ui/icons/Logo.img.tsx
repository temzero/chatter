import chatterLogoUrl from "/public/chatter-logo.svg";

export const Logo = ({ className = "", color = "var(--text-color)" }) => (
  <img
    src={chatterLogoUrl}
    alt="Chatter logo"
    className={`w-10 ${className}`}
    style={{ color, filter: "brightness(0) invert(1)" }}
  />
);
