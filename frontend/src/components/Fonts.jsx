import React from "react";
import { Global } from "@emotion/react";

function Fonts() {
    return (
        <>
            {/* Import the Google font 'Adamina' as a separate Global component */}
            <Global
                styles={`
                    @import url('https://fonts.googleapis.com/css2?family=Adamina&display=swap');
                `}
            />

            {/* Define custom fonts using @font-face in another Global component */}
            <Global
                styles={`
                    @font-face {
                        font-family: 'MontrealBook';
                        font-style: normal;
                        font-weight: 400;
                        font-display: swap;
                        src: url("/fonts/PPNeueMontreal-Book.woff2") format('woff2');
                    }
                    @font-face {
                        font-family: 'MontrealMedium';
                        font-style: normal;
                        font-weight: 700;
                        font-display: swap;
                        src: url('/fonts/PPNeueMontreal-Medium.woff2') format('woff2');
                    }
                `}
            />
        </>
    );
}

export default Fonts;
