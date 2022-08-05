/* eslint-disable import/prefer-default-export */
const htmlToElement = `
	function htmlToElement(html) {
		var template = document.createElement('template');
		html = html.trim();
		template.innerHTML = html;
		return template.content.firstChild;
	}
`;

export const PleaseSignIn = `
${htmlToElement}
document.body.prepend(htmlToElement(
	\`
	<div id="jobapplier-modal" class="jobapplier-modal">
		<div id="jobapplier-modal-content">
			<span class="jobapplier-close">&times;</span>
			<p style="font-size: 20px;">Message from JobApplier</p>
			<p style="font-size: 15px;">Please sign into Indeed to get started</p>
		</div>
	</div>
	\`
));
var modal = document.getElementById("jobapplier-modal");
modal.style = \`
	position: fixed;
	z-index: 1000;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: auto;
	background-color: rgb(0,0,0);
	background-color: rgba(0,0,0,0.4);
\`
document.getElementById("jobapplier-modal-content").style = \`
	background-color: #fefefe;
	margin: 15% auto;
	padding: 20px;
	border: 1px solid #888;
	width: 30%;
\`
var span = document.getElementsByClassName("jobapplier-close")[0];
span.style = \`
	color: #aaa;
	float: right;
	font-size: 28px;
	font-weight: bold;
	cursor: pointer;
\`
span.onclick = function() {
	modal.style.display = "none";
}
`;

export const DoNotInteract = `
${htmlToElement}
document.body.prepend(htmlToElement(
	\`
	<div id="jobapplier-modal" class="jobapplier-modal">
		<div id="jobapplier-modal-content">
			<span class="jobapplier-close">&times;</span>
			<p style="font-size: 20px;">Message from JobApplier</p>
			<p style="font-size: 15px;">
			This window is controlled by JobApplier.
			Please do not interact with this chrome window.
			If anything goes wrong, restart the app and let us know what went wrong
			so that we can fix it. email: mahmoudmousahamad@gmail.com
			</p>
		</div>
	</div>
	\`
));
var modal = document.getElementById("jobapplier-modal");
modal.style = \`
	position: fixed;
	z-index: 1000;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: auto;
	background-color: rgb(0,0,0);
	background-color: rgba(0,0,0,0.4);
\`
document.getElementById("jobapplier-modal-content").style = \`
	background-color: #fefefe;
	margin: 15% auto;
	padding: 20px;
	border: 1px solid #888;
	width: 30%;
\`
var span = document.getElementsByClassName("jobapplier-close")[0];
span.style = \`
	color: #aaa;
	float: right;
	font-size: 28px;
	font-weight: bold;
	cursor: pointer;
\`
span.onclick = function() {
	modal.style.display = "none";
}
`;
