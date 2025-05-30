import React from "react";
import _ from "lodash";
import RGL, { WidthProvider, Layout } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

interface BasicLayoutProps {
    className?: string;
    items: number;
    rowHeight: number;
    onLayoutChange: (layout: Layout[]) => void;
    cols: number;
    y?: number;
}

interface BasicLayoutState {
    layout: Layout[];
}

export default class BasicLayout extends React.PureComponent<BasicLayoutProps, BasicLayoutState> {
    static defaultProps = {
        className: "layout",
        items: 20,
        rowHeight: 30,
        onLayoutChange: function () { },
        cols: 12
    };

    constructor(props: BasicLayoutProps) {
        super(props);

        const layout = this.generateLayout();
        this.state = { layout };
    }

    generateDOM() {
        return _.map(_.range(this.props.items), function (i) {
            return (
                <div key={i}>
                    <span className="text">{i}</span>
                </div>
            );
        });
    }

    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), function (item, i) {
            const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
            return {
                x: (i * 2) % 12,
                y: Math.floor(i / 6) * (y as number),
                w: 2,
                h: y as number,
                i: i.toString()
            };
        });
    }

    onLayoutChange(layout: Layout[]) {
        this.props.onLayoutChange(layout);
    }

    render() {
        const { onLayoutChange, ...otherProps } = this.props;
        return (
            <ReactGridLayout
                layout={this.state.layout}
                onLayoutChange={this.onLayoutChange}
                {...otherProps}
            >
                {this.generateDOM()}
            </ReactGridLayout>
        );
    }
}