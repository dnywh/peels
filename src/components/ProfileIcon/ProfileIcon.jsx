import IconWrapper from "../IconWrapper";

function ProfileIcon({ size = "24", variant = "outline", label = "Profile" }) {
  if (variant === "solid") {
    return (
      <IconWrapper size={size} label={label}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 10C7.5 7.51472 9.51472 5.5 12 5.5C14.4853 5.5 16.5 7.51472 16.5 10C16.5 12.4853 14.4853 14.5 12 14.5C9.51472 14.5 7.5 12.4853 7.5 10Z"
          fill="currentColor"
        />
        <path
          d="M18.3068 18.4206C17.6012 15.594 15.0452 13.5 12 13.5C8.95488 13.5 6.39881 15.594 5.69324 18.4206C7.3172 20.016 9.5437 21 12 21C14.4564 21 16.6828 20.016 18.3068 18.4206Z"
          fill="currentColor"
        />
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </IconWrapper>
    );
  }

  return (
    <IconWrapper size={size} label={label} fill="none">
      <path
        d="M18 20C18 18.4087 17.3679 16.8826 16.2426 15.7574C15.1174 14.6321 13.5913 14 12 14C10.4087 14 8.88258 14.6321 7.75736 15.7574C6.63214 16.8826 6 18.4087 6 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconWrapper>
  );
}

export default ProfileIcon;
