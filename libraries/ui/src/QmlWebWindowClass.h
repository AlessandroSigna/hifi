//
//  Created by Bradley Austin Davis on 2015-12-15
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#ifndef hifi_ui_QmlWebWindowClass_h
#define hifi_ui_QmlWebWindowClass_h

#include <QtCore/QObject>
#include <GLMHelpers.h>
#include <QtScript/QScriptValue>
#include <QtQuick/QQuickItem>
#include <QtWebChannel/QWebChannelAbstractTransport>

class QScriptEngine;
class QScriptContext;
class QmlWebWindowClass;
class QWebSocketServer;
class QWebSocket;

class QmlScriptEventBridge : public QObject {
    Q_OBJECT
public:
    QmlScriptEventBridge(const QmlWebWindowClass* webWindow) : _webWindow(webWindow) {}

public slots :
    void emitWebEvent(const QString& data);
    void emitScriptEvent(const QString& data);

signals:
    void webEventReceived(const QString& data);
    void scriptEventReceived(int windowId, const QString& data);

private:
    const QmlWebWindowClass* _webWindow { nullptr };
    QWebSocket *_socket { nullptr };
};

// FIXME refactor this class to be a QQuickItem derived type and eliminate the needless wrapping 
class QmlWebWindowClass : public QObject {
    Q_OBJECT
    Q_PROPERTY(QObject* eventBridge READ getEventBridge CONSTANT)
    Q_PROPERTY(int windowId READ getWindowId CONSTANT)
    Q_PROPERTY(QString url READ getURL CONSTANT)
    Q_PROPERTY(glm::vec2 position READ getPosition WRITE setPosition)
    Q_PROPERTY(glm::vec2 size READ getSize WRITE setSize)
    Q_PROPERTY(bool visible READ isVisible WRITE setVisible NOTIFY visibilityChanged)

public:
    static QScriptValue constructor(QScriptContext* context, QScriptEngine* engine);
    QmlWebWindowClass(QObject* qmlWindow);

public slots:
    bool isVisible() const;
    void setVisible(bool visible);

    glm::vec2 getPosition() const;
    void setPosition(const glm::vec2& position);
    void setPosition(int x, int y);

    glm::vec2 getSize() const;
    void setSize(const glm::vec2& size);
    void setSize(int width, int height);

    QString getURL() const;
    void setURL(const QString& url);

    void setTitle(const QString& title);

    // Ugh.... do not want to do
    Q_INVOKABLE void raise();
    Q_INVOKABLE void close();
    Q_INVOKABLE int getWindowId() const { return _windowId; };
    Q_INVOKABLE QmlScriptEventBridge* getEventBridge() const { return _eventBridge; };

signals:
    void visibilityChanged(bool visible);  // Tool window
    void urlChanged();
    void moved(glm::vec2 position);
    void resized(QSizeF size);
    void closed();

private slots:
    void hasClosed();
    void handleNavigation(const QString& url);

private:
    static void setupServer();
    static QWebSocketServer* _webChannelServer;

    QQuickItem* asQuickItem() const;
    QmlScriptEventBridge* const _eventBridge { new QmlScriptEventBridge(this) };

    // FIXME needs to be initialized in the ctor once we have support
    // for tool window panes in QML
    const bool _isToolWindow { false };
    const int _windowId;
    QObject* const _qmlWindow;
};

#endif
