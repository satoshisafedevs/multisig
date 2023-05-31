import React, { useEffect } from "react";
import { Flex, Text, Link } from "@chakra-ui/react";

export default function ThemeSwitcher() {
    useEffect(() => {
        document.title = "404 Page - ProntoAI";
    }, []);

    return (
        <Flex margin="auto" flexDirection="column" align="center">
            <Text fontSize="lg" fontWeight="semibold" paddingBottom="50px">
                I am 404 page &#128169;
            </Text>
            <Text fontSize="lg">
                Let&apos;s go <Link href="/">&#127969;</Link>
            </Text>
        </Flex>
    );
}
