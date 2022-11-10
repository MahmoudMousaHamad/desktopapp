export function profileFilled() {
	const titles = JSON.parse(localStorage.getItem("titles"));
	const locations = JSON.parse(localStorage.getItem("locations"));
	const type = JSON.parse(localStorage.getItem("job-type"));
	const experience = JSON.parse(localStorage.getItem("experience-level"));

	return titles?.length > 0 && locations?.length > 0 && type && experience;
}

export const pause = () => {
	window.electron.ipcRenderer.send("scraper:pause");
};

export const resume = () => {
	window.electron.ipcRenderer.send("scraper:resume");
};

export const start = () => {
	window.electron.ipcRenderer.send("scraper:start", {
		experienceLevel: JSON.parse(localStorage.getItem("experience-level")),
		answers: JSON.parse(localStorage.getItem("user-answers")),
		locations: JSON.parse(localStorage.getItem("locations")),
		jobType: JSON.parse(localStorage.getItem("job-type")),
		titles: JSON.parse(localStorage.getItem("titles")),
		coverLetter: localStorage.getItem("cover-letter"),
		site: localStorage.getItem("site") || "INDEED",
	});
};

export const stop = () => {
	window.electron.ipcRenderer.send("scraper:stop");
};
