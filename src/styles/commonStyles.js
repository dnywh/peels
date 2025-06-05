// Instances can get stuck at old versions
// Reload dev server to see changes (and possibly remove, re-add instances of the below too)

// Common text block styling on static pages like the index, newsletter
export const sharedSectionTextBlockStyles = ({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.gap.sectionInner,

    "& > *": {
        textAlign: "center",
        textWrap: "balance",
    },
});
