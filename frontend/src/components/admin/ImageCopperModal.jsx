import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import "cropperjs/dist/cropper.css";
import PropTypes from "prop-types";
import React, { useState } from "react";
import ReactCropper from "react-cropper";

const StyledReactCropper = styled(ReactCropper)`
    .cropper-crop-box,
    .cropper-view-box,
    .cropper-move {
        border-radius: 50%;
    }

    .cropper-view-box {
        box-shadow: 0 0 0 1px #39f;
        outline: 0;
    }
`;

function ImageCropperModal({ isOpen, onClose, isSaving, selectedImage, handleImageSave }) {
    const [cropper, setCropper] = useState();
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalHeader>Crop photo</ModalHeader>
                <ModalBody>
                    <StyledReactCropper
                        src={selectedImage}
                        style={{ height: 500, width: "100%" }}
                        aspectRatio={1}
                        preview=".img-preview"
                        viewMode={1}
                        guides={false}
                        minCropBoxHeight={10}
                        minCropBoxWidth={10}
                        background={false}
                        responsive
                        autoCropArea={1}
                        checkOrientation={false}
                        onInitialized={(instance) => {
                            setCropper(instance);
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        isLoading={isSaving}
                        loadingText="Uploading"
                        colorScheme="blueSwatch"
                        onClick={() => handleImageSave(cropper)}
                    >
                        Crop and Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

ImageCropperModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handleImageSave: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
    selectedImage: PropTypes.string,
};
export default ImageCropperModal;
