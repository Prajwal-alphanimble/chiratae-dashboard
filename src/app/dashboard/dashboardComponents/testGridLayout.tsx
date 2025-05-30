import FundPerformanceTable from "@/components/custom/FundPerformanceTable";
import { JsonArray } from "@/generated/prisma/runtime/library";
import React from "react";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(RGL);

interface MyFirstGridProps {
    className?: string;
    layoutElements: Layout[];
    isEditMode: boolean;
}

interface MyFirstGridState {
    layout: Layout[];
}

class MyFirstGrid extends React.Component<MyFirstGridProps, MyFirstGridState> {
    constructor(props: MyFirstGridProps) {
        super(props);
        // Try to load saved layout from localStorage, fallback to props
        const savedLayout = localStorage.getItem('gridLayout');
        this.state = {
            layout: savedLayout ? JSON.parse(savedLayout) : props.layoutElements
        };
    }

    onLayoutChange = (layout: Layout[]) => {
        console.log('Layout changed:', layout);
        this.setState({ layout });
        // Save layout to localStorage whenever it changes
        localStorage.setItem('gridLayout', JSON.stringify(layout));
    };

    componentDidUpdate(prevProps: MyFirstGridProps) {
        // Only update from props if there's no saved layout
        if (!localStorage.getItem('gridLayout') && prevProps.layoutElements !== this.props.layoutElements) {
            this.setState({ layout: this.props.layoutElements });
        }
    }

    render() {
        return (
            <div className="p-4" style={{ width: '100%', height: '100vh' }}>
                <ReactGridLayout
                    className="layout"
                    layout={this.state.layout}
                    cols={12}
                    rowHeight={100}
                    onLayoutChange={this.onLayoutChange}
                    draggableHandle=".drag-handle"
                    margin={[20, 20]}
                    containerPadding={[20, 20]}
                    isResizable={this.props.isEditMode}
                    isDraggable={this.props.isEditMode}
                    preventCollision={false}
                    compactType="vertical"
                    useCSSTransforms={true}
                    style={{ width: '100%' }}
                >
                    <div key="1" className={`bg-white ${this.props.isEditMode ? 'drag-handle' : ''} rounded shadow`} style={{ border: '1px solid #ccc' }}>
                        <div className="p-4"><FundPerformanceTable /></div>
                    </div>
                    <div key="2" className={`bg-white ${this.props.isEditMode ? 'drag-handle' : ''} rounded shadow`} style={{ border: '1px solid #ccc' }}>
                        <div className="p-4">Item 2</div>
                    </div>
                    <div key="3" className={`bg-white ${this.props.isEditMode ? 'drag-handle' : ''} rounded shadow`} style={{ border: '1px solid #ccc' }}>
                        <div className="p-4"><input placeholder="input" className="h-full w-full"></input></div>
                    </div>
                </ReactGridLayout>
            </div>
        );
    }
}

export default MyFirstGrid;