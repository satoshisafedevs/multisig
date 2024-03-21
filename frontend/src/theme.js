import { extendTheme } from "@chakra-ui/react";

// when testing new initial values of color mode config make sure to delete
// browsers app local storage for chakra-ui-color-mode and refresh
const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

const styles = {
    global: (props) => ({
        "html, body, #root": {
            height: "100%",
            overflow: "unset",
            margin: "0",
            padding: "0",
            scrollbarColor: props.colorMode === "light" ? "lightgray transparent" : "dimgray transparent",
            "*::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
            },
            "*::-webkit-scrollbar-thumb": {
                background: props.colorMode === "light" ? "lightgray" : "dimgray",
                borderRadius: "6px",
            },
            "*::-webkit-scrollbar-corner": {
                background: "transparent",
            },
            ...(props.colorMode === "light" && {
                backgroundColor: "#EFF3F8",
            }),
        },
    }),
};

// use generator https://supercolorpalette.com/ to create new custom color scheme of any hex for 10 colors
const colors = {
    blue1: "#0F2143",
    blue2: "#556981",
    blue3: "#6196E5",
    bronze: "#AF937F",
    blueSwatch: {
        50: "#e9f3ff",
        100: "#cdd8e6",
        200: "#b0becf",
        300: "#92a4b9",
        400: "#758aa4",
        500: "#5b718a",
        600: "#46586d",
        700: "#313f4f",
        800: "#1a2632",
        900: "#000f17",
    },
    bronzeSwatch: {
        50: "#fdf1e4",
        100: "#e7d6cb",
        200: "#d0bdaf",
        300: "#bba290",
        400: "#a78872",
        500: "#8d6e58",
        600: "#6f5644",
        700: "#4f3d2f",
        800: "#312419",
        900: "#190900",
    },
    orangeWarning: "#FFA500",
    redWarning: "#CC0000",
};

const components = {
    Accordion: {
        baseStyle: (props) => ({
            button: {
                _hover: {
                    background:
                        props.colorMode === "light"
                            ? "var(--chakra-colors-blackAlpha-100)"
                            : "var(--chakra-colors-blackAlpha-300)",
                },
            },
        }),
    },
};

const theme = extendTheme({ config, styles, colors, components });

export default theme;
