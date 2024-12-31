import { withPigment } from "@pigment-css/nextjs-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPigment(nextConfig, {
    theme: {
        colors: {
            primary: '#FFC700', // Yellow
            secondary: 'hsla(22, 100%, 14%, 1)', // Dark Brown
        },
        spacing: {
            unit: 8,
        },
        typography: {
            fontFamily: "Inter, sans-serif",
        },
    },
});
