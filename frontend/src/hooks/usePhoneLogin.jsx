import { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase";
import { formatPhoneNumber, extractNumbers } from "../utils";

const usePhoneLogin = () => {
    const [phone, setPhone] = useState("");
    const [buttonSpinner, setButtonSpinner] = useState(false);
    const [recap, setRecap] = useState();
    const [validNumber, setValidNumber] = useState(true);
    const [confirmationNumber, setConfirmationNumber] = useState();
    const [signInStatus, setSignInStatus] = useState();
    const [errorMsg, setErrorMsg] = useState("");
    const [pin, setPin] = useState();

    const signInSubmit = async () => {
        const num = extractNumbers(phone);
        if (num.length !== 10) {
            setValidNumber(false);
            return;
        }
        setButtonSpinner(true);
        const pNum = `+1${num}`;
        let localRecap = null;
        try {
            if (!recap) {
                localRecap = new RecaptchaVerifier(
                    "recaptcha",
                    {
                        size: "invisible",
                    },
                    auth,
                );
                setRecap(localRecap);
            } else {
                localRecap = recap;
            }
            const cNum = await signInWithPhoneNumber(auth, pNum, localRecap);
            setConfirmationNumber(cNum);
            setButtonSpinner(false);
        } catch (e) {
            setSignInStatus("phoneNumberFailure");
            // eslint-disable-next-line no-debugger
            setErrorMsg(e.message);
        }
    };

    const onPhoneChange = (e) => {
        const onlyNumbers = extractNumbers(e.target.value);
        if (onlyNumbers.length === 10) {
            setPhone(formatPhoneNumber(onlyNumbers));
        } else if (onlyNumbers.length > 10) {
            // do nothing
        } else {
            setPhone(e.target.value);
        }
    };

    const resetState = () => {
        setPhone("");
        setButtonSpinner(false);
        setValidNumber(true);
        setConfirmationNumber();
        setSignInStatus();
        setErrorMsg();
    };

    const onPinChange = async (value) => {
        if (value.length === 6) {
            try {
                setButtonSpinner(true);
                await confirmationNumber.confirm(value);
                setSignInStatus("signInSuccess");
            } catch (e) {
                setSignInStatus("verificationFailure");
            }
            setPin();
        } else {
            setPin(value);
        }
    };

    return {
        onPinChange,
        onPhoneChange,
        signInSubmit,
        buttonSpinner,
        validNumber,
        signInStatus,
        phone,
        confirmationNumber,
        resetState,
        errorMsg,
        pin,
    };
};

export default usePhoneLogin;
