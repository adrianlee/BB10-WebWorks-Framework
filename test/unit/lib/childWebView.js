describe("childWebView", function () {
    var libPath = "./../../../",
        overlayWebView = require(libPath + "lib/overlayWebView"),
        childWebView,
        mockedController,
        mockedWebview,
        mockedApplication,
        CONTROLS_HEIGHT = 121 + 10; // height + border;

    beforeEach(function () {
        childWebView = require(libPath + "lib/childWebView");
        mockedController = {
            enableWebInspector: undefined,
            enableCrossSiteXHR: undefined,
            visible: undefined,
            active: undefined,
            setGeometry: jasmine.createSpy(),
            publishRemoteFunction: jasmine.createSpy()
        };
        mockedWebview = {
            id: 42,
            enableCrossSiteXHR: undefined,
            visible: undefined,
            active: undefined,
            zOrder: undefined,
            url: undefined,
            setFileSystemSandbox: undefined,
            setGeometry: jasmine.createSpy(),
            setApplicationOrientation: jasmine.createSpy(),
            setExtraPluginDirectory: jasmine.createSpy(),
            notifyApplicationOrientationDone: jasmine.createSpy(),
            onContextMenuRequestEvent: undefined,
            onNetworkResourceRequested: undefined,
            destroy: jasmine.createSpy(),
            executeJavaScript: jasmine.createSpy(),
            windowGroup: undefined,
            addEventListener: jasmine.createSpy(),
            enableWebEventRedirect: jasmine.createSpy(),
            addKnownSSLCertificate: jasmine.createSpy(),
            continueSSLHandshaking: jasmine.createSpy()
        };
        mockedApplication = {
            windowVisible: undefined
        };
        GLOBAL.qnx = {
            callExtensionMethod: jasmine.createSpy(),
            webplatform: {
                getController: function () {
                    return mockedController;
                },
                createWebView: function (options, createFunction) {
                    //process.nextTick(createFunction);
                    //setTimeout(createFunction,0);
                    if (typeof options === 'function') {
                        runs(options);
                    }
                    else {
                        runs(createFunction);
                    }
                    return mockedWebview;
                },
                getApplication: function () {
                    return mockedApplication;
                }
            }
        };
        GLOBAL.window = {
            qnx: qnx
        };
        GLOBAL.screen = {
            width : 1024,
            height: 768
        };
        spyOn(overlayWebView, 'executeJavascript');
        childWebView.destroy();
    });

    describe('init', function () {
        it("publishes the childWebView.back remote function", function () {
            var spy = mockedController.publishRemoteFunction;
            childWebView.init();
            expect(spy).toHaveBeenCalledWith('childWebView.back', jasmine.any(Function));
        });
        it("publishes the childWebView.destroy remote function", function () {
            var spy = mockedController.publishRemoteFunction;
            childWebView.init();
            expect(spy).toHaveBeenCalledWith('childWebView.destroy', jasmine.any(Function));
        });
    });

    describe("create", function () {
        it("calls the ready function", function () {
            var chuck = jasmine.createSpy();
            childWebView.create(chuck);
            waitsFor(function () {
                return chuck.wasCalled;
            }, 500);
        });

        it("shows the overlay chrome", function () {
            var chuck = jasmine.createSpy();
            runs(function () {
                childWebView.create(chuck);
            });
            waitsFor(function () {
                return chuck.wasCalled;
            }, 500);
            runs(function () {
                var spy = overlayWebView.executeJavascript;
                expect(spy).toHaveBeenCalledWith("require('childWebViewControls').show();");
            });
        });

        it("sets up the visible childWebView", function () {
            var chuck = jasmine.createSpy();
            runs(function () {
                childWebView.create(chuck);
            });
            waitsFor(function () {
                return chuck.wasCalled;
            }, 500);
            runs(function () {
                expect(mockedWebview.visible).toEqual(true);
                expect(mockedWebview.active).toEqual(true);
                expect(mockedWebview.zOrder).toEqual(1);
                expect(mockedWebview.setGeometry).toHaveBeenCalledWith(0, CONTROLS_HEIGHT, screen.width, screen.height - CONTROLS_HEIGHT);
                expect(mockedWebview.enableWebEventRedirect.argsForCall[0]).toEqual(['JavaScriptCallback', 1]);
            });
        });
    });

    describe("id", function () {
        it("can get the id for the webiew", function () {
            childWebView.create();
            childWebView.id();
            expect(mockedWebview.id).toEqual(42);
        });
    });

    describe("geometry", function () {
        it("can set geometry", function () {
            childWebView.create();
            childWebView.setGeometry(0, 0, 100, 200);
            expect(mockedWebview.setGeometry).toHaveBeenCalledWith(0, 0, 100, 200);
        });
    });

    describe("application orientation", function () {
        it("can set application orientation", function () {
            childWebView.create();
            childWebView.setApplicationOrientation(90);
            expect(mockedWebview.setApplicationOrientation).toHaveBeenCalledWith(90);
        });

        it("can notifyApplicationOrientationDone", function () {
            childWebView.create();
            childWebView.notifyApplicationOrientationDone();
            expect(mockedWebview.notifyApplicationOrientationDone).toHaveBeenCalled();
        });
    });

    describe("methods other than create", function () {
        it("calls the underlying destroy", function () {
            childWebView.create(mockedWebview);
            childWebView.destroy();
            expect(mockedWebview.destroy).toHaveBeenCalled();
        });

        it("sets the url property", function () {
            var url = "http://AWESOMESAUCE.com";
            childWebView.create(mockedWebview);
            childWebView.setURL(url);
            expect(mockedWebview.url).toEqual(url);
        });

        it("calls the underlying executeJavaScript", function () {
            var js = "var awesome='Jasmine BDD'";
            childWebView.create(mockedWebview);
            childWebView.executeJavascript(js);
            expect(mockedWebview.executeJavaScript).toHaveBeenCalledWith(js);
        });
        it("calls the underlying windowGroup property", function () {
            childWebView.create(mockedWebview);
            expect(childWebView.windowGroup()).toEqual(mockedWebview.windowGroup);
        });
    });

    describe("opening with a url", function () {
        var spy,
            url = 'http://www.google.com';

        beforeEach(function () {
            spy = jasmine.createSpy();
            spyOn(childWebView, 'setURL');
            spyOn(childWebView, 'create').andCallThrough();
        });

        it("creates a webview if one does not already exist", function () {
            runs(function () {
                childWebView.open(url, spy);
            });
            waitsFor(function () {
                return spy.wasCalled;
            }, 500);
            runs(function () {
                expect(childWebView.create).toHaveBeenCalled();
                expect(childWebView.setURL).toHaveBeenCalledWith(url);
            });
        });

        it("reuses a webview if one already exists", function () {
            runs(function () {
                childWebView.open(url, spy);
            });
            waitsFor(function () {
                return spy.wasCalled;
            }, 500);

            runs(function () {
                spy = jasmine.createSpy();
                childWebView.open(url, spy);
            });
            waitsFor(function () {
                return spy.wasCalled;
            }, 500);

            runs(function () {
                expect(childWebView.create.callCount).toEqual(1);
                expect(childWebView.setURL.callCount).toEqual(2);
            });
        });
    });

    describe("the back button", function () {
        it("calls the qnx extension method", function () {
            childWebView.back();
            expect(qnx.callExtensionMethod).toHaveBeenCalledWith("webview.goBack", mockedWebview.id);
        });
    });
});
