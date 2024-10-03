var DEANS_DEVELOPING = false

export class DragOrderedGrid {
    constructor({ container }) {
        if (!isElement(container)) {
            return console.error(
                "DragOrderedGrid container must be HTMLElement"
            );
        }

        const childSnaps = [];
        const currentPositions = {};
        const elements = {};

        //
        
        //

        //

        function isElement(element) {
            return element instanceof Element || element instanceof HTMLDocument;
        }
        
        function debounce(func, timeout = 300){
            let timer;
            return (...args) => {
              clearTimeout(timer);
              timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
          }
        
        
        function createGhostGrid(parent, children) {
            const ghost = document.createElement("div");
            ghost.style.position = "absolute";
            ghost.style.top = parent.offsetTop + "px";
            ghost.style.left = parent.offsetLeft + "px";
            ghost.style.width = parent.offsetWidth + "px";
            ghost.style.height = parent.offsetHeight + "px";
            ghost.style.zIndex = "-1";
        
            children.forEach((child, idx) => {
                const childGhost = document.createElement("div");
        
                childGhost.style.position = "absolute";
                childGhost.style.top = child.offsetTop + "px";
                childGhost.style.left = child.offsetLeft + "px";
                childGhost.style.width = child.element.offsetWidth + "px";
                childGhost.style.height = child.element.offsetHeight + "px";
        
                if (DEANS_DEVELOPING) {
                    childGhost.style.background = "gray";
                }
                childGhost.setAttribute("data-index", idx.toString());
        
                ghost.appendChild(childGhost);
            });
        
            parent.appendChild(ghost);
        
            return ghost;
        }
        
        function mouseIsHoveringElement(element, e) {
            const rect = element.getBoundingClientRect();
            return (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );
        }
        
        function handleMouseMoved(
            draggedElement,
            ghostGrid,
            e,
            initCurrentPositions
        ) {
            let indexOfHoveredElement = -1;
            ghostGrid.childNodes.forEach((child, idx) => {
                if (indexOfHoveredElement !== -1) {
                    return;
                }
        
                if (!(child instanceof HTMLElement)) {
                    return;
                }
        
                const isHovering = mouseIsHoveringElement(child, e);
                if (isHovering) {
                    console.log("hovering", idx);
                    indexOfHoveredElement = idx;
                }
            });
        
            const draggedElementId = draggedElement.getAttribute("data-id");
            if (!draggedElementId) {
                return console.error("dragged element id not found :S");
            }
            const draggedElementCurrent = currentPositions[draggedElementId];
        
            if (indexOfHoveredElement === -1) {
                console.log("index of hovered in NONE");
                Object.values(initCurrentPositions).forEach((initPosition) => {
                    if (initPosition.id === draggedElementId) {
                        currentPositions[initPosition.id].index =
                            initPosition.index;
                        return;
                    }
        
                    elements[
                        initPosition.id
                    ].style.top = `${initPosition.offsetTop}px`;
                    elements[
                        initPosition.id
                    ].style.left = `${initPosition.offsetLeft}px`;
        
                    currentPositions[initPosition.id] = initPosition;
                });
        
                return;
            }
        
            const nextPositionChanges = {};
        
            Object.values(currentPositions).forEach((currentPosition) => {
                if (
                    indexOfHoveredElement < draggedElementCurrent.index &&
                    currentPosition.index >= indexOfHoveredElement &&
                    currentPosition.index < draggedElementCurrent.index
                ) {
                    const nextElementIndex = currentPosition.index + 1;
                    const ghostElementReference = ghostGrid.childNodes[
                        nextElementIndex
                    ];
        
                    nextPositionChanges[currentPosition.id] = {
                        ...currentPosition,
                        index: nextElementIndex,
                        offsetLeft: ghostElementReference.offsetLeft,
                        offsetTop: ghostElementReference.offsetTop,
                    };
                }
        
                if (
                    indexOfHoveredElement > draggedElementCurrent.index &&
                    currentPosition.index <= indexOfHoveredElement &&
                    currentPosition.index > draggedElementCurrent.index
                ) {
                    const nextElementIndex = currentPosition.index - 1;
                    const ghostElementReference = ghostGrid.childNodes[
                        nextElementIndex
                    ];
        
                    nextPositionChanges[currentPosition.id] = {
                        ...currentPosition,
                        index: nextElementIndex,
                        offsetLeft: ghostElementReference.offsetLeft,
                        offsetTop: ghostElementReference.offsetTop,
                    };
                }
            });
        
            Object.values(nextPositionChanges).forEach((nextPosition) => {
                const element = elements[nextPosition.id];
                if (!element) {
                    return console.error("no element here :S");
                }
        
                element.style.transition = "all 0.2s ease-in-out";
                element.style.top = `${nextPosition.offsetTop}px`;
                element.style.left = `${nextPosition.offsetLeft}px`;
        
                currentPositions[nextPosition.id] = nextPosition;
            });
        
            draggedElementCurrent.index = indexOfHoveredElement;
            const ghostElementReference = ghostGrid.childNodes[
                draggedElementCurrent.index
            ];
        
            draggedElementCurrent.offsetLeft = ghostElementReference.offsetLeft;
            draggedElementCurrent.offsetTop = ghostElementReference.offsetTop;
        }
        
        const debounceMouseMoved = debounce(handleMouseMoved, 100);
        
        
        
        function drag(
            element,
            dragStart,
            elementStart,
            ghostGrid,
            initCurrentPositions
        ) {
            return function (e) {
                const currentMousePosition = {
                    x: e.clientX,
                    y: e.clientY,
                };
        
                const delta = {
                    x: currentMousePosition.x - dragStart.x,
                    y: currentMousePosition.y - dragStart.y,
                };
        
                element.style.transition = "none";
        
                element.style.left = `${elementStart.x + delta.x}px`;
                element.style.top = `${elementStart.y + delta.y}px`;
        
                debounceMouseMoved(element, ghostGrid, e, initCurrentPositions);
            };
        }

        //

        //

        //

        container.childNodes.forEach((child) => {
            if (!isElement(child)) {
                return console.error("child is not an Element :S");
            }

            const childSnapshot = {
                offsetTop: child.offsetTop,
                offsetLeft: child.offsetLeft,
                element: child,
            };

            childSnaps.push(childSnapshot);
        });

        const ghostGrid = createGhostGrid(container, childSnaps);

        childSnaps.forEach((childSnap, idx) => {
            childSnap.element.style.position = "absolute";
            childSnap.element.style.top = `${childSnap.offsetTop}px`;
            childSnap.element.style.left = `${childSnap.offsetLeft}px`;

            const elementId = idx.toString();
            childSnap.element.setAttribute("data-id", elementId);

            elements[elementId] = childSnap.element;

            currentPositions[elementId] = {
                id: elementId,
                index: idx,
                offsetLeft: childSnap.element.offsetLeft,
                offsetTop: childSnap.element.offsetTop,
            };

            childSnap.element.addEventListener("mousedown", (e) => {
                const currentMousePosition = {
                    x: e.clientX,
                    y: e.clientY,
                };

                const currentElementPosition = {
                    x: childSnap.element.offsetLeft,
                    y: childSnap.element.offsetTop,
                };

                const dragFn = drag(
                    childSnap.element,
                    currentMousePosition,
                    currentElementPosition,
                    ghostGrid,
                    { ...currentPositions }
                );

                window.addEventListener("mousemove", dragFn);

                window.addEventListener("mouseup", () => {
                    childSnap.element.style.transition = "all 0.2s ease-in-out";
                    window.removeEventListener("mousemove", dragFn);
                    childSnap.element.style.top = `${currentPositions[elementId].offsetTop}px`;
                    childSnap.element.style.left = `${currentPositions[elementId].offsetLeft}px`;
                });
            });
        });
    }
}
