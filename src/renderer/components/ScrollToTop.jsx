/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ refProp }) {
	const { pathname } = useLocation();

	useEffect(() => {
		if (refProp.current) refProp.current.scrollTo(0, 0);
	}, [pathname, refProp]);

	return null;
}
