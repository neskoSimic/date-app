import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

const HEART_PATH =
  'M300,520 C-100,250 80,-80 300,160 C520,-80 700,250 300,520';

function HeartBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.z = 850;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = 'heartCanvas';
    mount.appendChild(renderer.domElement);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.setAttribute('viewBox', '0 0 600 552');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    path.setAttribute('d', HEART_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const colorChoices = [
      new THREE.Color('#ff4da6'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#ff1744'),
      new THREE.Color('#20ff4a')
    ];

    const heartPositions = [];
    const length = path.getTotalLength();
    for (let i = 0; i < length; i += 0.55) {
      const point = path.getPointAtLength(i);
      heartPositions.push(point.x - 300, -point.y + 260, (Math.random() - 0.5) * 160);
    }

    const heartGeometry = new THREE.BufferGeometry();
    heartGeometry.setAttribute('position', new THREE.Float32BufferAttribute(heartPositions, 3));
    heartGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(makeRandomColors(heartPositions.length / 3, colorChoices), 3)
    );

    const heartMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particleHeart = new THREE.Points(heartGeometry, heartMaterial);
    scene.add(particleHeart);

    const centerShape = new THREE.Shape();
    centerShape.moveTo(0, 35);
    centerShape.bezierCurveTo(0, 65, -55, 75, -55, 25);
    centerShape.bezierCurveTo(-55, -10, -20, -25, 0, -55);
    centerShape.bezierCurveTo(20, -25, 55, -10, 55, 25);
    centerShape.bezierCurveTo(55, 75, 0, 65, 0, 35);

    const centerGeometry = new THREE.ExtrudeGeometry(centerShape, {
      depth: 35,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 8,
      bevelThickness: 8
    });
    centerGeometry.center();

    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5fa8,
      roughness: 0.45,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    const centerHeart = new THREE.Mesh(centerGeometry, centerMaterial);
    centerHeart.scale.set(1.25, 1.25, 1.25);
    scene.add(centerHeart);

    const light1 = new THREE.PointLight(0xff8ac8, 2, 1000);
    light1.position.set(200, 200, 400);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, 1.3, 1000);
    light2.position.set(-250, -100, 500);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const bgPositions = [];
    for (let i = 0; i < 800; i += 1) {
      bgPositions.push(
        (Math.random() - 0.5) * 1600,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 900
      );
    }

    const bgGeometry = new THREE.BufferGeometry();
    bgGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(makeRandomColors(bgPositions.length / 3, colorChoices), 3)
    );

    const bgMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const backgroundParticles = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(backgroundParticles);

    const tweens = [
      gsap.to(particleHeart.rotation, {
        y: Math.PI * 2,
        duration: 13,
        repeat: -1,
        ease: 'none'
      }),
      gsap.to(centerHeart.rotation, {
        y: Math.PI * 2,
        duration: 4,
        repeat: -1,
        ease: 'none'
      }),
      gsap.to(centerHeart.scale, {
        x: 1.45,
        y: 1.45,
        z: 1.45,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    ];

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      particleHeart.rotation.z = Math.sin(time * 0.4) * 0.08;
      backgroundParticles.rotation.y += 0.0006;
      backgroundParticles.rotation.z += 0.0004;
      centerHeart.rotation.x = Math.sin(time) * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      tweens.forEach((tween) => tween.kill());
      scene.remove(particleHeart, centerHeart, light1, light2, ambientLight, backgroundParticles);
      heartGeometry.dispose();
      heartMaterial.dispose();
      centerGeometry.dispose();
      centerMaterial.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      svg.remove();
    };
  }, []);

  return <div className="heartBackground" ref={mountRef} aria-hidden="true" />;
}

function makeRandomColors(count, choices) {
  const colors = [];
  for (let i = 0; i < count; i += 1) {
    const color = choices[Math.floor(Math.random() * choices.length)];
    colors.push(color.r, color.g, color.b);
  }
  return colors;
}

export default HeartBackground;
