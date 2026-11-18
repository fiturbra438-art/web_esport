<template>
    <form class="mb-4">
        <div class="mb-3">
            <label for="name" class="form-label">Nama</label>
            <input type="text" class="form-control" id="name" />
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" />
        </div>
        <div class="mb-3">
            <label for="message" class="form-label">Pesan</label>
            <textarea class="form-control" id="message"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</template>

<script>
export default {};
</script>