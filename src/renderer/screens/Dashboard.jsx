/* eslint-disable react/style-prop-object */
/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, List, ListItem } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import { CreditCard } from "@mui/icons-material";
import { ProgressBar } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import "react-circular-progressbar/dist/styles.css";

import OnboardingModal from "../components/OnboardingModal";
import { start, stop } from "../BotHelpers";
import Layout from "../components/Layout";
import QA from "../components/QA";

import LinkedInLogo from "../../../assets/images/linkedin.png";
import IndeedLogo from "../../../assets/images/indeed.png";

const DashBox = ({ upperLeft, upperRight, left, right, bottom }) => {
	return (
		<Box
			sx={{
				borderRadius: "20px",
				backgroundColor: "white",
				boxShadow: "0px 2px 4px 2px #efefef, 0px 2px 4px 2px #efefef",
				position: "relative",
				margin: "10px",
				p: 2,
			}}
		>
			<Box
				sx={{
					gridTemplateColumns: "1fr 1fr",
					padding: "10px 0px",
					color: "#44517d",
					display: "grid",
				}}
			>
				<Box sx={{ textAlign: "left" }}>{upperLeft}</Box>
				<Box sx={{ textAlign: "end" }}>{upperRight}</Box>
			</Box>
			<Box
				sx={{
					gridTemplateColumns: "1fr 1fr",
					padding: "10px 0px",
					color: "#44517d",
					display: "grid",
				}}
			>
				<div
					style={{
						justifyContent: "flex-start",
						alignItems: "flex-end",
						display: "flex",
					}}
				>
					{left}
				</div>
				<div
					style={{
						justifyContent: "flex-end",
						alignItems: "flex-end",
						display: "flex",
					}}
				>
					{right}
				</div>
			</Box>
			<Box>{bottom}</Box>
		</Box>
	);
};

const PlatformBox = ({ logoSrc, name, points, startProp, beta }) => {
	return (
		<div
			style={{
				width: "auto",
				height: "500px",
				textAlign: "center",
				borderRadius: "20px",
				backgroundColor: "white",
				boxShadow: "0px 2px 4px 2px #efefef, 0px 2px 4px 2px #efefef",
				position: "relative",
				margin: "10px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "80px",
				}}
			>
				<img width="40px" height="40px" src={logoSrc} alt={name} />
			</div>
			<p
				style={{
					fontWeight: "bold",
					textTransform: "uppercase",
				}}
			>
				{name}
			</p>
			<List>
				{points.map((p) => (
					<ListItem key={p}>{p}</ListItem>
				))}
			</List>
			<Button onClick={startProp}>Start Applying on {name}</Button>
		</div>
	);
};

const linkedinPoints = [
	"740 million members with over 55 million registered companies.",
	"The largest social network of professional networking and career development.",
	"Make sure you have a complete profile along with a resume uploaded before start applying.",
	"Make sure you are logged in to Linkedin before you start applying.",
];

const indeedPoints = [
	"Over 16 million postings and 8.2 jobs are posted every second.",
	"Indeed is the most popular job posting site in the world.",
	"Make sure you have a complete profile along with a resume uploaded, before start applying.",
	"Make sure you are logged in to Indeed before you start applying",
];

export default () => {
	const { "bot-status-change": botStatus } = useSelector(
		(state) => state.socket
	);
	const { isLoggedIn, user } = useSelector((state) => state.auth);
	const dispatchRedux = useDispatch();
	const navigator = useNavigate();

	useEffect(() => {
		if (user?.dayTotal >= user?.dailyLimit && botStatus === "start") stop();
	}, [user, botStatus]);
	if (!isLoggedIn) return <Navigate to="/login" />;
	if (!user) {
		return (
			<Box
				sx={{
					justifyContent: "center",
					flexDirection: "column",
					alignItems: "center",
					display: "flex",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	const monthPercentage = 100 * (user.monthTotal / user.monthlyLimit);
	const dayPercentage = 100 * (user.dayTotal / user.dailyLimit);

	return (
		<>
			{localStorage.getItem("onboard-done") !== "true" && <OnboardingModal />}
			<Layout.SidePane>
				{!user?.hasPlan && (
					<Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
						<Button
							endIcon={<CreditCard />}
							onClick={() => navigator("/pricing")}
						>
							PURCHASE A PLAN NOW!
						</Button>
					</Box>
				)}
				<Box
					sx={{
						justifyContent: "center",
						flexDirection: "column",
						alignItems: "center",
						display: "flex",
					}}
				>
					<Box
						sx={{
							display: "flex",
							width: "100%",
							justifyContent: "space-between",
							backgroundColor: "#f8f9fd",
							borderRadius: "20px",
							margin: "10px",
							padding: "10px",
						}}
					>
						<DashBox
							upperLeft="Daily Limit"
							upperRight="Daily Limit Left"
							left={user.hasPlan ? user.dailyLimit : "No plan"}
							right={
								user.hasPlan ? (
									<>
										<span style={{ fontWeight: "bold" }}>{user.dayTotal}/</span>
										{user.dailyLimit}
									</>
								) : (
									<span>0</span>
								)
							}
							bottom={<ProgressBar now={dayPercentage} />}
						/>
						<DashBox
							upperLeft="Your Plan Details"
							upperRight="Plan Ending"
							left={user.hasPlan ? user.planName : "No plan"}
							right={user.hasPlan ? user.planEndDate : "--"}
							bottom={
								user.hasPlan
									? `You are in ${user.planName} that is valid until ${user.planEndDate}`
									: "You don't have a plan, please purchase one"
							}
						/>
						<DashBox
							upperLeft="Total Jobs Applied"
							upperRight="Monthly Limit Left"
							left={user.hasPlan ? user.totalCount : "No plan"}
							right={
								user.hasPlan ? (
									<>
										<span style={{ fontWeight: "bold" }}>
											{user.monthTotal}/
										</span>
										{user.monthlyLimit}
									</>
								) : (
									<span>0</span>
								)
							}
							bottom={
								user.hasPlan ? (
									<>
										<ProgressBar now={monthPercentage} />
										<div>{`${Math.fround(
											monthPercentage
										)}% used, Indeed: XX, LinkedIn: YY`}</div>
									</>
								) : (
									"You don't have a plan, please purchase one"
								)
							}
						/>
					</Box>
				</Box>
				<Box
					sx={{
						justifyContent: "center",
						flexDirection: "column",
						alignItems: "center",
						display: "flex",
					}}
				>
					<Box
						style={{
							display: "flex",
							width: "100%",
							justifyContent: "space-between",
							backgroundColor: "#f8f9fd",
							borderRadius: "20px",
							margin: "10px",
							padding: "10px",
						}}
					>
						<PlatformBox
							logoSrc={LinkedInLogo}
							name="LinkedIn"
							points={linkedinPoints}
							start={() => {
								localStorage.site = "LINKEDIN";
								start();
							}}
						/>
						<PlatformBox
							logoSrc={IndeedLogo}
							name="Indeed"
							points={indeedPoints}
							start={() => {
								localStorage.site = "INDEED";
								start();
							}}
						/>
					</Box>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
					<QA />
				</Box>
			</Layout.SidePane>
		</>
	);
};
