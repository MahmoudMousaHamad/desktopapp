/* eslint-disable react/prop-types */
import { Button } from "@mui/joy";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

const MyDialog = ({ title, message, onClose, open, onDontShowAgain }) => {
	return (
		<Dialog onClose={() => onClose()} open={open}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					{message}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				{onDontShowAgain && (
					<Button
						onClick={() => {
							onDontShowAgain();
							onClose();
						}}
					>
						Don&apos;t Show Again
					</Button>
				)}
				<Button onClick={onClose} autoFocus>
					OK
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default MyDialog;
