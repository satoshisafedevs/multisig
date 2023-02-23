// 1. import `extendTheme` function
import { extendTheme } from "@chakra-ui/react";

// 2. Add your color mode config
// when testing new config initial values make sure to delete
// browsers app local storage for chakra-ui-color-mode and refresh
const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

// 3. extend the theme
const theme = extendTheme({ config });

export default theme;
