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
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });

    // Create walls and ground
    const walls = [
      // Ground
      Matter.Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight,
        window.innerWidth,
        20,
        { 
          isStatic: true,
          render: { visible: false }
        }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        0,
        window.innerHeight / 2,
        1,
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
        1,
        window.innerHeight,
        { 
          isStatic: true,
          render: { visible: true }
        }
      )
    ];

    // Add walls to the world
    Matter.World.add(engine.world, walls);

    Matter.Render.run(render);

    const runner = Matter.Runner.create();
    // Start the engine and renderer
    Matter.Runner.run(runner, engine);

    engineRef.current = engine;

    // Handle window resize
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      
      // Update walls positions
      Matter.Body.setPosition(walls[0], {
        x: window.innerWidth / 2,
        y: window.innerHeight
      });
      Matter.Body.setPosition(walls[2], {
        x: window.innerWidth,
        y: window.innerHeight / 2
      });
    };

    window.addEventListener('resize', handleResize);

    // Handle clicks
    const handleClick = (event: MouseEvent) => {
      const getScale = (size: number) => {
        return (size * 0.029) / 40;
      }

      // Get random size between 30-60, weighted towards 40
      const size = 40 + (Math.random() - Math.random()) * 20;

      const sheep = Matter.Bodies.circle(event.clientX, event.clientY, size, {
        restitution: 0.8,
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

    document.addEventListener('click', handleClick);

    return () => {
      Matter.Engine.clear(engine);
      Matter.Render.stop(render);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999
      }}
    />
  );
}; 