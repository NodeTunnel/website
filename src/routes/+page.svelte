<script>
	import Highlight from 'svelte-highlight';
	import gdscript from 'svelte-highlight/languages/javascript';
	import horizonDark from 'svelte-highlight/styles/github-dark';

	const code = `@onready var nodetunnel = NodeTunnelPeer.new()

func _ready():
    nodetunnel.connect_to_relay("us-east.nodetunnel.io:8080", "my_game")
    multiplayer.multiplayer_peer = nodetunnel

func host():
    nodetunnel.host_room(true, "My Game Room", 4)
    var room_id = await nodetunnel.room_connected
    DisplayServer.clipboard_set(room_id)

func join(room_id):
    nodetunnel.join_room(room_id)`;
</script>

<svelte:head>
	{@html horizonDark}
	<title>NodeTunnel</title>
</svelte:head>

<div class="bg-base-200 p-3 sm:p-8">
	<h1 class="text-2xl font-bold md:max-w-4/6 md:text-5xl">
		The easiest solution to NAT traversal for Godot.
	</h1>
	<p class="py-4 text-sm md:max-w-1/2 md:text-xl">
		NodeTunnel provides bulletproof connectivity for Godot multiplayer games. No port forwarding, no
		dedicated servers.
	</p>
	<div class="flex flex-row gap-2">
		<a
			href="https://github.com/NodeTunnel/godot-plugin/releases/latest"
			class="btn btn-sm btn-primary md:btn-md">Get started</a
		>
		<a href="https://github.com/NodeTunnel/godot-plugin" class="btn btn-sm md:btn-md">Source</a>
	</div>
</div>

<hr class="border text-base-300" />

<div class="p-3 sm:p-8">
	<h1 class="max-w-4/6 text-xl font-semibold md:text-3xl">Bulletproof connectivity</h1>
	<p class="py-4 text-sm md:text-lg">
		Public relay servers allow players to connect regardless of their NAT setup. If you can view
		this website, you can almost certainly connect over NodeTunnel. <span class="font-semibold"
			>No more port-forwarding, no more dedicated servers.</span
		>
	</p>
</div>

<div class="px-3 sm:px-8">
	<h1 class="max-w-4/6 text-xl font-semibold md:text-3xl">Easy to implement</h1>
	<p class="py-4 text-sm md:text-lg">
		NodeTunnel was made specifically for Godot's High-Level Multiplayer API, meaning your existing
		games will work as they did before.
	</p>
	<p class="text-sm md:text-lg">
		Moving to NodeTunnel is super simple, and requires
		<span class="font-semibold">less than 15 lines of code </span>
		to get started.
	</p>

	<div class="mt-4 hidden w-full overflow-x-auto rounded-sm sm:block">
		<Highlight class="min-w-max text-xs md:text-sm" language={gdscript} {code} />
	</div>

	<a href="https://nodetunnel.github.io/docs/" class="btn mt-2 btn-sm md:btn-md">Read the docs</a>
</div>

<div class="p-3 sm:p-8">
	<h1 class="max-w-4/6 text-xl font-semibold md:text-3xl">Lightweight servers</h1>
	<p class="py-4 text-sm md:text-lg">
		Both the Godot plugin and relay server software are made in Rust. This allows NodeTunnel to be
		extremely lightweight. Even the smallest servers can handle hundreds of peers at once, making
		NodeTunnel an affordable alternative to dedicated game servers.
	</p>
	<p class="text-sm md:text-lg">
		Don't want to self host? Don't worry! NodeTunnel provides <b>free</b> relay servers that anyone can
		use.
	</p>

	<a href="https://github.com/NodeTunnel/relay-server" class="btn mt-2 btn-sm md:btn-md"
		>See server source</a
	>
</div>

<hr class="mt-8 border text-base-300" />

<div class="flex flex-col items-center bg-base-200 p-3 sm:p-8">
	<h1 class="text-2xl font-bold">Keep NodeTunnel free, for everyone</h1>
	<p class="py-4 text-sm sm:text-center">
		NodeTunnel is completely free to use, but running the relay servers and maintaining the project
		comes with real costs. If NodeTunnel helps your game, please consider donating to keep the
		servers running and the project available for everyone.

		<br />
		<br />

		<i>Prefer to contribute in other ways? Code contributions are also greatly appreciated!</i>
	</p>
	<div class="flex flex-row gap-2">
		<a href="https://ko-fi.com/curtjs" class="btn btn-sm btn-primary">Donate</a>
	</div>
</div>
