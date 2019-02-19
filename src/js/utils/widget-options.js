export function onClose(){
    if (window.kyberWidgetOptions && window.kyberWidgetOptions.onClose){
        window.kyberWidgetOptions.onClose()
    }else{
        window.close()
    }
    if (window.parent && (typeof window.parent.postMessage !== "undefined")){
        window.parent.postMessage("CloseWidget", "*")
    }
}

export function postMessageBroadCasted() {
    window.parent.postMessage("Broadcasted", "*")
}
