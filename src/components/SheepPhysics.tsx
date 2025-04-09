import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export const SheepPhysics = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>(null);
  const sheepBodiesRef = useRef<Matter.Body[]>([]);

  useEffect(() => {
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight + 50,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });

    let walls: Array<Matter.Body> | null = null;
    const recreateWalls = () => {
      if(walls !== null) {
        Matter.World.remove(engine.world, walls);
      }

      walls = [
        // Ground
        Matter.Bodies.rectangle(
          window.innerWidth / 2,
          window.innerHeight + 50,
          window.innerWidth,
          100, // Double the bottom padding (since the rectangle is centered at the end of the canvas)
          { 
            isStatic: true,
            render: { visible: false }
          }
        ),
        // Left wall
        Matter.Bodies.rectangle(
          0,
          window.innerHeight / 2,
          2,
          window.innerHeight,
          { 
            isStatic: true,
            render: { visible: false }
          }
        ),
        // Right wall
        Matter.Bodies.rectangle(
          window.innerWidth,
          window.innerHeight / 2,
          2,
          window.innerHeight,
          { 
            isStatic: true,
            render: { visible: false }
          }
        )
      ];
      Matter.World.add(engine.world, walls);
    };

    recreateWalls();

    Matter.Render.run(render);

    const runner = Matter.Runner.create();
    // Start the engine and renderer
    Matter.Runner.run(runner, engine);

    engineRef.current = engine;

    // Handle window resize
    const handleResize = () => {
      Matter.Render.setSize(render, window.innerWidth, window.innerHeight + 50);
      
      recreateWalls();
    };

    window.addEventListener('resize', handleResize);

    const createSheep = (x: number, y: number) => {
      const getScale = (size: number) => {
        return (size * 0.029) / 40;
      }

      // Get random size between 30-60, weighted towards 40
      const size = 40 + (Math.random() - Math.random()) * 20;
      const angle = Math.PI * 2 + (Math.random() - Math.random()) * Math.PI * 2;

      const sheep = Matter.Bodies.circle(x, y, size, {
        restitution: 0.8,
        angle,
        render: {
          sprite: {
            texture: '/hitsuji-ball--white.svg',
            xScale: getScale(size),
            yScale: getScale(size),
          }
        }
      });

      Matter.World.add(engine.world, sheep);
      sheepBodiesRef.current.push(sheep);
    };

    const handleClick = (event: MouseEvent) => {
      createSheep(event.clientX, event.clientY);
    };

    document.addEventListener('click', handleClick);

    let rainInterval: number | null = null;
    const stopRain = () => {
      if(rainInterval !== null) clearInterval(rainInterval);
    }
    const startRain = () => {
      stopRain();
      rainInterval = setInterval(() => {
        const randomX = Math.random() * (window.innerWidth - 100) + 50;
  
        createSheep(randomX, -100);
      }, 2000);
    };
    startRain();

    window.addEventListener('blur', stopRain);
    window.addEventListener('focus', startRain);

    return () => {
      stopRain();

      Matter.Engine.clear(engine);
      Matter.Render.stop(render);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', stopRain);
      window.removeEventListener('focus', startRain);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
};