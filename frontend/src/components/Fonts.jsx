import React from "react";
import { Global } from "@emotion/react";

function Fonts() {
    return (
        <Global
            styles={`

                /* Import the Google font 'Adamina' */
                @import url('https://fonts.googleapis.com/css2?family=Adamina&display=swap');

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
    );
}

export default Fonts;
