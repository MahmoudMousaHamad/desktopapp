/* eslint-disable react/style-prop-object */
/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
import { useDispatch, useSelector } from "react-redux";
import {
	Avatar,
	Box,
	Button,
	List,
	ListItem,
	Sheet,
	Typography,
} from "@mui/joy";
import {
	CircularProgress,
	LinearProgress,
	ListItemAvatar,
	ListItemText,
} from "@mui/material";
import { CreditCard, InfoRounded } from "@mui/icons-material";
import { ProgressBar } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import "react-circular-progressbar/dist/styles.css";

import { STOP_SESSION } from "../actions/types";
import { stop } from "../BotHelpers";
import Layout from "../components/Layout";

import LinkedInLogo from "../../../assets/images/linkedin.png";
import IndeedLogo from "../../../assets/images/indeed.png";

const SpanIfString = ({ comp }) => {
	return (
		<>
			{typeof comp === "string" ? (
				<Typography display="inline-block">{comp}</Typography>
			) : (
				comp
			)}
		</>
	);
};

const DashBox = ({ upperLeft, upperRight, left, right, bottom }) => {
	return (
		<Box
			sx={{
				borderRadius: "20px",
				backgroundColor: "background.componentBg",
				boxShadow: "0px 2px 4px 2px #efefef, 0px 2px 4px 2px #efefef",
				position: "relative",
				margin: "10px",
				p: 2,
				minWidth: "300px",
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
				<Box sx={{ textAlign: "left" }}>
					<SpanIfString comp={upperLeft} />
				</Box>
				<Box sx={{ textAlign: "end" }}>
					<SpanIfString comp={upperRight} />
				</Box>
			</Box>
			<Box
				sx={{
					gridTemplateColumns: "1fr 1fr",
					padding: "10px 0px",
					color: "#44517d",
					display: "grid",
				}}
			>
				<Box
					sx={{
						justifyContent: "flex-start",
						alignItems: "flex-end",
						display: "flex",
					}}
				>
					<SpanIfString comp={left} />
				</Box>
				<Box
					sx={{
						justifyContent: "flex-end",
						alignItems: "flex-end",
						display: "flex",
					}}
				>
					<SpanIfString comp={right} />
				</Box>
			</Box>
			<Box>
				<SpanIfString comp={bottom} />
			</Box>
		</Box>
	);
};

const PlatformBox = ({ logoSrc, name, points, user }) => {
	const navigator = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				alignItems: "center",
				width: "auto",
				height: "500px",
				borderRadius: "20px",
				backgroundColor: "background.componentBg",
				boxShadow: "0px 2px 4px 2px #efefef, 0px 2px 4px 2px #efefef",
				position: "relative",
				margin: "10px",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "80px",
				}}
			>
				<img width="40px" height="40px" src={logoSrc} alt={name} />
			</Box>
			<Typography
				level="h4"
				fontWeight={700}
				sx={{
					fontWeight: "bold",
					textTransform: "uppercase",
					textAlign: "center",
				}}
			>
				{name}
			</Typography>
			<List sx={{ width: "100%", bgcolor: "background.paper" }} dense>
				{points.map((p) => (
					<ListItem key={p}>
						<ListItemAvatar>
							<Avatar>
								<InfoRounded />
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={p} />
					</ListItem>
				))}
			</List>
			<Button
				sx={{ mb: 2 }}
				onClick={() => {
					if (
						Date.now() > new Date(user.plan?.endDate).getTime() ||
						user.dayTotal >= user.plan.dailyLimit
					) {
						navigator("/pricing");
					} else {
						localStorage.setItem("site", name);
						navigator("/filters");
					}
				}}
			>
				Start Applying on {name}
			</Button>
		</Box>
	);
};

const linkedinPoints = [
	"740 million members with over 55 million registered companies.",
	"The largest social network of professional networking and career development.",
	"Make sure you have a complete resume along with a resume uploaded before start applying.",
	"Make sure you are logged in to Linkedin before you start applying.",
];

const indeedPoints = [
	"Over 16 million postings and 8.2 jobs are posted every second.",
	"Indeed is the most popular job posting site in the world.",
	"Make sure you have a complete resume along with a resume uploaded, before start applying.",
	"Make sure you are logged in to Indeed before you start applying",
];

export default () => {
	const { sessionInProgress, site, sessionJobCount } = useSelector(
		(s) => s.applier
	);
	const { user } = useSelector((state) => state.socket);
	const { isLoggedIn } = useSelector((state) => state.auth);
	const navigator = useNavigate();
	const dispatch = useDispatch();

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

	const monthPercentage =
		100 *
		(Math.min(user.monthTotal, user.plan.monthlyLimit) /
			user.plan.monthlyLimit);
	const dayPercentage =
		100 *
		(Math.min(user.dayTotal, user.plan.dailyLimit) / user.plan.dailyLimit);

	const linkedinJobs = user?.jobs.filter((job) => job.site === "LINKEDIN");
	const indeedJobs = user?.jobs.filter((job) => job.site === "INDEED");

	const endDateString = user.plan.endDate
		? new Date(user.plan?.endDate).toLocaleDateString()
		: "";

	return (
		<>
			<Layout.SidePane>
				{!user?.plan.purchased && (
					<Sheet
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: 2,
						}}
						variant="solid"
						color="warning"
					>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<InfoRounded sx={{ mr: 2 }} />
							<Typography
								level="body1"
								fontWeight={600}
								textTransform="uppercase"
								maxWidth="500px"
							>
								This is a trial. You are limited to{" "}
								<u>10 submissions per day for 30 days</u>. Purchase a plan for
								full access.
							</Typography>
						</Box>
						<Button
							endIcon={<CreditCard />}
							onClick={() => navigator("/pricing")}
							variant="solid"
							color="danger"
						>
							PURCHASE A PLAN NOW!
						</Button>
					</Sheet>
				)}
				{sessionInProgress && (
					<DashBox
						upperLeft="Session in progress"
						upperRight={site}
						left={`${
							sessionJobCount === 0 ? "No" : sessionJobCount
						} application${sessionJobCount > 1 ? "s" : ""} submitted so far`}
						right={
							<Button
								color="danger"
								size="md"
								onClick={() => {
									dispatch({
										type: STOP_SESSION,
									});
									stop();
								}}
							>
								STOP APPLYING
							</Button>
						}
						bottom={<LinearProgress sx={{ mt: 1 }} color="primary" />}
					/>
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
							backgroundColor: "background.componentBg",
							borderRadius: "20px",
							margin: "10px",
							padding: "10px",
						}}
					>
						<DashBox
							upperLeft="Daily Limit"
							upperRight="Daily Limit Left"
							left={user.plan.dailyLimit}
							right={
								<>
									<Typography
										display="inline-block"
										sx={{ fontWeight: "bold" }}
									>
										{user.dayTotal}/
									</Typography>
									<Typography display="inline-block">
										{user.plan.dailyLimit}
									</Typography>
								</>
							}
							bottom={
								<LinearProgress
									sx={{ mt: 1 }}
									variant="determinate"
									color="success"
									value={dayPercentage}
								/>
							}
						/>
						<DashBox
							upperLeft="Your Plan Details"
							upperRight="Plan Valid Until"
							left={
								<Typography textTransform="capitalize">
									{user.plan.name} Plan
								</Typography>
							}
							right={user.plan.endDate ? endDateString : "NEVER"}
							bottom={
								user.plan.endDate && user.plan.name === "trial"
									? `Your trial ends on ${endDateString}`
									: `You're in ${user.plan.name.toUpperCase()} plan that is valid ${
											user.plan.endDate ? `until ${endDateString}` : "FOREVER!"
									  }`
							}
						/>
						<DashBox
							upperLeft="Total Jobs Applied"
							upperRight="Monthly Limit Left"
							left={user.totalCount}
							right={
								<>
									<Typography
										display="inline-block"
										sx={{ fontWeight: "bold" }}
									>
										{user.monthTotal}/
									</Typography>
									<Typography display="inline-block">
										{user.plan.monthlyLimit}
									</Typography>
								</>
							}
							bottom={
								<>
									<ProgressBar now={monthPercentage} />
									<Box>{`${
										Math.round(monthPercentage * 100) / 100
									}% used, Indeed: ${indeedJobs.length}, LinkedIn: ${
										linkedinJobs.length
									}`}</Box>
								</>
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
						sx={{
							display: "flex",
							width: "100%",
							justifyContent: "space-between",
							backgroundColor: "background.componentBg",
							borderRadius: "20px",
							margin: "10px",
							padding: "10px",
						}}
					>
						<PlatformBox
							logoSrc={LinkedInLogo}
							name="LINKEDIN"
							points={linkedinPoints}
							user={user}
						/>
						<PlatformBox
							logoSrc={IndeedLogo}
							name="INDEED"
							points={indeedPoints}
							user={user}
						/>
					</Box>
				</Box>
				{/* <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
					<QA />
				</Box> */}
			</Layout.SidePane>
		</>
	);
};
