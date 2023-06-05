//this is a reusable modal/dialog component based on Material UI. I will be using this through the app.

/* 
- open: bool to determine if dialogue should be rendered
- children: prop to get the component's children. it will be rendered in the dialogue content
- title: title of dialogue
- contentText: message that will be displayed in the dialogue
- handleContinue: function that runs when button is pressed
*/

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export default function CustomDialog({ open, children, title, contentText, handleContinue }) {
    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {contentText}
                </DialogContentText>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleContinue}>Continue</Button>
            </DialogActions>
        </Dialog>
    )
}