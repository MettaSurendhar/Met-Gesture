/* eslint-disable no-unused-vars */
import './App.css';
import React, { useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import { drawHand } from './utilities';

import * as fp from 'fingerpose';
import victory from './victory.png';
import thumbs_up from './thumbs_up.png';

function App() {
	// Set up references
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const [emoji, setEmoji] = useState(null);
	const images = { thumbs_up: thumbs_up, victory: victory };

	// Load handpose
	const runHandGesture = async () => {
		const net = await handpose.load();
		console.log('handpose model loaded');
		setInterval(() => {
			detect(net);
		}, 100);
	};

	// Detect function
	const detect = async (net) => {
		// Check data is available
		if (
			typeof webcamRef.current !== 'undefined' &&
			webcamRef.current !== null &&
			webcamRef.current.video.readyState === 4
		) {
			// Get video properties
			const video = webcamRef.current.video;
			const videoHeight = webcamRef.current.video.videoHeight;
			const videoWidth = webcamRef.current.video.videoWidth;
			// Set video height and width
			webcamRef.current.video.width = videoWidth;
			webcamRef.current.video.height = videoHeight;
			// Set canvas height and width
			canvasRef.current.height = videoHeight;
			canvasRef.current.width = videoWidth;
			// Make detections
			const hand = await net.estimateHands(video);

			if (hand.length > 0) {
				const GE = new fp.GestureEstimator([
					fp.Gestures.VictoryGesture,
					fp.Gestures.ThumbsUpGesture,
				]);

				const gesture = await GE.estimate(hand[0].landmarks, 8);

				if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
					const confidence = gesture.gestures.map((prediction) => {
						return prediction.score;
					});
					const maxConfidence = confidence.indexOf(
						Math.max.apply(null, confidence)
					);
					setEmoji(gesture.gestures[maxConfidence].name);
				}
			}

			// Draw mesh
			const ctx = canvasRef.current.getContext('2d');
			drawHand(hand, ctx);
		}
	};

	runHandGesture();

	return (
		<div className='App'>
			<h1
				style={{
					margin: 0,
					padding: 0,
					paddingTop: '8vh',
				}}
			>
				MET - GESTURE DETECTOR
			</h1>
			<header className='App-header'>
				<Webcam
					ref={webcamRef}
					style={{
						position: 'absolute',
						marginLeft: 'auto',
						marginRight: 'auto',
						left: 0,
						right: 0,
						textAlign: 'center',
						zIndex: 9,
						width: 640,
						height: 480,
					}}
				/>
				<canvas
					ref={canvasRef}
					style={{
						position: 'absolute',
						marginLeft: 'auto',
						marginRight: 'auto',
						left: 0,
						right: 0,
						textAlign: 'center',
						zIndex: 9,
						width: 640,
						height: 480,
					}}
				/>
			</header>
			{emoji !== null ? (
				<img
					src={images[emoji]}
					alt=''
					style={{
						position: 'absolute',
						marginLeft: 'auto',
						marginRight: 'auto',
						left: 400,
						bottom: 500,
						right: 0,
						textAlign: 'center',
						height: 100,
						zIndex: 10,
					}}
				/>
			) : (
				''
			)}
		</div>
	);
}

export default App;
