

export function onClose(){
    console.log("close")
    if (window.kyberWidgetOptions && window.kyberWidgetOptions.onClose){
        window.kyberWidgetOptions.onClose()
    }else{
        window.close()
    }
    //check if iframe
    if (window.parent && typeof window.parent.postMessage === "function"){
        window.parent.postMessage("CloseWidget")
    }
}