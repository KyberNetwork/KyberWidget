

export function onClose(){
    console.log("close")
    if (window.kyberWidgetOptions && window.kyberWidgetOptions.onClose){
        window.kyberWidgetOptions.onClose()
    }else{
        window.close()
    }
    if (window.parent && (typeof window.parent.postMessage !== "undefined")){
        window.parent.postMessage("CloseWidget", "*")
    }
}

