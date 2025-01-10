import IconWrapper from "../IconWrapper";

function ChatsIcon({ size = "24", variant = "outline", label = "Chats" }) {
  if (variant === "solid") {
    return (
      <IconWrapper size={size} label={label}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.11896 3.91008C8.04524 2.50653 10.4095 1.83712 12.7856 2.02249C15.1618 2.20787 17.3936 3.23583 19.0789 4.92113C20.7642 6.60644 21.7922 8.83827 21.9776 11.2144C22.163 13.5906 21.4935 15.9548 20.09 17.8811C18.6864 19.8074 16.641 21.169 14.3224 21.7207C12.1442 22.2389 9.85945 22.0103 7.83253 21.0788L2.32107 22.9471C1.96061 23.0693 1.56205 22.9763 1.29292 22.7072C1.02379 22.438 0.930774 22.0395 1.05296 21.679L2.92125 16.1675C1.98982 14.1406 1.7612 11.8559 2.2794 9.67771C2.83103 7.35904 4.19268 5.31364 6.11896 3.91008ZM8 10.75C7.30964 10.75 6.75 11.3096 6.75 12C6.75 12.6904 7.30964 13.25 8 13.25H8.01C8.70036 13.25 9.26 12.6904 9.26 12C9.26 11.3096 8.70036 10.75 8.01 10.75H8ZM10.75 12C10.75 11.3096 11.3096 10.75 12 10.75H12.01C12.7004 10.75 13.26 11.3096 13.26 12C13.26 12.6904 12.7004 13.25 12.01 13.25H12C11.3096 13.25 10.75 12.6904 10.75 12ZM16 10.75C15.3096 10.75 14.75 11.3096 14.75 12C14.75 12.6904 15.3096 13.25 16 13.25H16.01C16.7004 13.25 17.26 12.6904 17.26 12C17.26 11.3096 16.7004 10.75 16.01 10.75H16Z"
          fill="currentColor"
        />
      </IconWrapper>
    );
  }

  return (
    <IconWrapper size={size} label={label}>
      <path
        d="M7.9 20C9.80858 20.9791 12.0041 21.2443 14.0909 20.7478C16.1777 20.2514 18.0186 19.0259 19.2818 17.2922C20.545 15.5586 21.1474 13.4308 20.9806 11.2922C20.8137 9.15366 19.8886 7.14502 18.3718 5.62824C16.855 4.11146 14.8464 3.1863 12.7078 3.01946C10.5693 2.85263 8.44147 3.45509 6.70782 4.71829C4.97417 5.98149 3.74869 7.82236 3.25222 9.90916C2.75575 11.996 3.02094 14.1915 4 16.1L2 22L7.9 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12H8.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12H16.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconWrapper>
  );
}

export default ChatsIcon;
