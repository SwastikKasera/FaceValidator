import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';
import { useNavigate } from 'react-router-dom';

const PersonValidator = () => {
  const navigate = useNavigate()
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [position, setPosition] = useState("Position");
  const [numPeople, setNumPeople] = useState(0);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc);

    const net = await posenet.load();
    const video = webcamRef.current.video;
    const poses = await net.estimateMultiplePoses(video, {
      flipHorizontal: true,
    });

    console.log(poses);

    setNumPeople(poses.length);

    // Draw dots on canvas
    drawDots(poses);

  }, [webcamRef]);

  const drawDots = (poses) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    });
  };
  

  useEffect(() => {
    const loadPosenet = async () => {
      const net = await posenet.load();
      setInterval(() => {
        detectPose(net);
      }, 1000);
    };

    const detectPose = async (net) => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const poses = await net.estimateMultiplePoses(video, {
          flipHorizontal: true,
        });
    
        console.log(poses);
    
        setNumPeople(poses.length);
    
        drawDots(poses);
    
        // For simplicity, check if there is more than one person and set position accordingly
        if (poses.length > 1) {
          setPosition("Multiple People");
        } else if (poses.length === 1) {
          const pose = poses[0];
          const eyeLeft = pose.keypoints.find((point) => point.part === 'leftEye');
          const eyeRight = pose.keypoints.find((point) => point.part === 'rightEye');
    
          // Define the missing variables
          const eyeMidpointX = (eyeLeft.position.x + eyeRight.position.x) / 2;
          const cameraMidpointX = video.width / 2;
          const threshold = 100; // You can adjust this threshold value
    
          if (eyeMidpointX < cameraMidpointX - threshold) {
            setPosition("Left");
          } else if (eyeMidpointX > cameraMidpointX + threshold) {
            setPosition("Right");
          } else {
            // Adjust the threshold for facing front
            const frontThreshold = 50;
            const eyeDistance = Math.abs(eyeLeft.position.x - eyeRight.position.x);
    
            if (eyeDistance < frontThreshold) {
              setPosition("Not Directly Facing");
            } else {
              setPosition("Front");
              navigate('/home')
            }
          }
        }
      }
    };
    

    loadPosenet();
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = webcamRef.current.video;

    canvas.width = video.width;
    canvas.height = video.height;
  }, [webcamRef]);
  

  return (
    <div>
      <Webcam
        audio={false}
        height={300}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        mirrored={true}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '0px',
          left: '6px',
          zIndex: '9',
          border: '2px solid blue',
          width: '400px',
          height: '304px',
        }}
      />
      <h2>{position}</h2>
      <p>Number of People: {numPeople}</p>
    </div>
  );
};

export default PersonValidator;
