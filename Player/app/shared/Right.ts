/// <reference path="../../js/jquery.d.ts" />
import baseApp = module("app/BaseApp");
import shell = module("app/shared/Shell");
import main = module("app/shared/Main");
import utils = module("app/Utils");
import baseView = module("app/BaseView");

export class Right extends baseView.BaseView {

    isExpanded: bool = false;

    constructor($element: JQuery) {
        super($element, false, true);
    }

    create(): void {
        super.create();

        this.$element.on('click', (e) => {
            e.preventDefault();

            this.toggle();
        });
    }

    toggle(): void {
        $.publish(baseApp.BaseApp.TOGGLE_RIGHTPANEL_START, [this.isExpanded]);

        var targetWidth = this.isExpanded ? baseApp.BaseApp.provider.options.rightPanelCollapsedWidth : baseApp.BaseApp.provider.options.rightPanelExpandedWidth;
        var targetLeft = this.isExpanded ? this.$element.parent().width() - baseApp.BaseApp.provider.options.rightPanelCollapsedWidth : this.$element.parent().width() - baseApp.BaseApp.provider.options.rightPanelExpandedWidth;

        this.isExpanded = !this.isExpanded;

        this.$element.stop().animate(
            {
                width: targetWidth,
                left: targetLeft
            },
            baseApp.BaseApp.provider.options.panelAnimationDuration,
            function () {
                $.publish(baseApp.BaseApp.TOGGLE_RIGHTPANEL_END, [this.isExpanded]);
                $.publish(baseApp.BaseApp.RESIZE);
            }
        );
    }

    resize(): void {
        super.resize();

        this.$element.css({
            'left': this.$element.parent().width() - this.$element.width()
        });
    }
}