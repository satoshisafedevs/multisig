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
    green300: {
        50: "#dbfae7",
        100: "#c2f5d5",
        200: "#aaeec4",
        300: "#93e6b3",
        400: "#7ddea2",
        500: "#68d391",
        600: "#56c881",
        700: "#44bb72",
        800: "#40a065",
        900: "#3b8758",
    },
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
