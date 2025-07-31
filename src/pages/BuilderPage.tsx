// src/pages/BuilderPage.tsx
import { useState } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { PersonaSelector } from '../components/PersonaSelector';
import { MemorySettings } from '../components/MemorySettings';

interface Tool {
  id: string;
  label: string;
  icon: string;
  description: string;
}

function DraggableTool({ tool }: { tool: Tool }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: tool.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group relative bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{tool.icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
            {tool.label}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
        </div>
      </div>
    </div>
  );
}

function CanvasTool({ tool, onRemove }: { tool: Tool; onRemove: () => void }) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-6 h-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove tool"
      >
        ×
      </button>
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{tool.icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{tool.label}</h4>
          <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  // 1) Define your tools palette with better descriptions and icons
  const tools: Tool[] = [
    { 
      id: 'web-search', 
      label: 'Web Search', 
      icon: '🔍',
      description: 'Search the web for real-time information'
    },
    { 
      id: 'calculator', 
      label: 'Calculator', 
      icon: '🧮',
      description: 'Perform mathematical calculations'
    },
    { 
      id: 'custom-prompt', 
      label: 'Custom Prompt', 
      icon: '✍️',
      description: 'Add custom instructions or prompts'
    },
    { 
      id: 'code-executor', 
      label: 'Code Executor', 
      icon: '⚡',
      description: 'Execute code snippets safely'
    },
    { 
      id: 'file-analyzer', 
      label: 'File Analyzer', 
      icon: '📄',
      description: 'Analyze and process files'
    },
  ];

  // 2) State for dropped tools and active drag
  const [canvasTools, setCanvasTools] = useState<Tool[]>([]);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  // 3) Sensors with better configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    })
  );

  // 4) Make the canvas droppable
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ 
    id: 'canvas' 
  });

  // 5) Handle drag start
  function handleDragStart(event: DragStartEvent) {
    const tool = tools.find((t) => t.id === event.active.id);
    setActiveTool(tool || null);
  }

  // 6) Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    setActiveTool(null);
    
    if (over?.id === 'canvas') {
      const tool = tools.find((t) => t.id === active.id);
      if (tool && !canvasTools.some((t) => t.id === tool.id)) {
        setCanvasTools((prev) => [...prev, tool]);
      }
    }
  }

  // 7) Remove tool from canvas
  function removeTool(toolId: string) {
    setCanvasTools((prev) => prev.filter((t) => t.id !== toolId));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Builder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Drag and drop tools to create your custom AI agent
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Preview
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Save Agent
              </button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Configuration Sections */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                <div className="space-y-4">
                  <PersonaSelector />
                  <MemorySettings />
                </div>
              </div>

              {/* Tools Panel */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Tools</h3>
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <DraggableTool key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Canvas Area */}
          <main className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Agent Canvas</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {canvasTools.length === 0 
                      ? "Drop tools here to build your agent" 
                      : `${canvasTools.length} tools added`
                    }
                  </p>
                </div>
                {canvasTools.length > 0 && (
                  <button
                    onClick={() => setCanvasTools([])}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Drop Zone */}
              <div
                ref={setDroppableRef}
                className={`
                  flex-1 border-2 border-dashed rounded-xl p-6 transition-all duration-200
                  ${isOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : canvasTools.length === 0
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }
                `}
              >
                {canvasTools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Start Building Your Agent
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Drag tools from the sidebar to this area to add them to your agent. 
                      Each tool will enhance your agent's capabilities.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {canvasTools.map((tool) => (
                      <CanvasTool
                        key={tool.id}
                        tool={tool}
                        onRemove={() => removeTool(tool.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTool ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg opacity-90">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{activeTool.icon}</div>
              <div>
                <h4 className="font-medium text-gray-900">{activeTool.label}</h4>
                <p className="text-sm text-gray-500">{activeTool.description}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}