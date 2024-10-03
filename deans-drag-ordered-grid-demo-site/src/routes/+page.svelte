<script>
    import { onMount } from "svelte";

    onMount(async function () {
        const { DragOrderedGrid } = await import("deans-drag-ordered-grid");

        new DragOrderedGrid({ container: document.getElementById("the-box") });
    });

    const colors = [
        "red",
        "green",
        "blue",
        "yellow",
        "orange",
        "purple",
        "pink",
        "brown",
        "black",
        "teal",
        "maroon",
        "navy",
        "olive",
    ];

    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }
</script>

<div class="main-content">
    <div id="the-box">
        {#each Array(8) as nothing}
            <div style:background-color={randomColor()} class="grid-block" />
        {/each}
    </div>
</div>

<style>
    .main-content {
        margin: 200px auto 0;
        max-width: 500px;
        position: relative;
    }

    #the-box {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .grid-block {
        width: 150px;
        height: 150px;
        border-radius: 12px;
        overflow: hidden;
    }
</style>
