d3.csv("pokemons_trio.csv")
  .then((source) => {
  		// prepare container
		const width = 760;
		const aspectRatio = 2 / Math.sqrt(3);
		const height = width / aspectRatio;

		const types = [	
						"dark",
						"bug",
						"dragon",
						"electric",
						"fire",
						"fighting",
						"fairy",
						"flying",
						"ghost",
						"psychic",
						"ground",
						"grass",
						"poison",
						"steel",
						"ice",
						"rock",
						"water",
						"normal"];

		const scaleColor =d3.scaleSequential(d3.interpolateRainbow)
    						.domain([0, types.length]);

    	const getColor = (d) => {
    		if (d == "normal") {
    			return "#444";
    		}
    		let idx = types.indexOf(d);
    		return scaleColor(idx);
    	}

		const svg = d3.select("#pokemons_triangle")
						.append("svg")
						.attr("width", width)
						.attr("height", height)
					.append("g")
						.attr("transform", `translate(${width / 2}, ${ 2 * height / 3 })`);

		// scale radius
		const powerRange = d3.extent(source, (d) => +d.power);
		const scaleRadius = d3.scaleSqrt()
								.range([1, 5])
								.domain(powerRange);

		// scale coordinates
		const triangle = {
			attack: { title: "Attack", x: Math.sqrt(3), y: 1},
			speed: { title: "Speed", x: 0, y: -2},
			defense: { title: "Defense", x: -Math.sqrt(3), y: 1}
		};
		const scaleCoord = d3.scaleLinear()
						.range([0, height / 3 - 50])
						.domain([0, 1]);

		// calculate coordinates
		const minRatio = 0.3;
		const coeff = 1 / (1 - minRatio);
		const calcX = (item)  => {

			const x = item.attack_b * triangle.attack.x + 
					  item.speed_b * triangle.speed.x +
					  item.defense_b * triangle.defense.x;
			return coeff * scaleCoord(x);
		};

		const calcY = (item) => {

			const y = item.attack_b * triangle.attack.y + 
					  item.speed_b * triangle.speed.y +
					  item.defense_b * triangle.defense.y;
			return coeff * scaleCoord(y);
		};

		// use the force
		const simulation = d3.forceSimulation(source)
							      .force("x", d3.forceX((d) => calcX(d)).strength(1))
							      .force("y", d3.forceY((d) => calcY(d)).strength(1))
							      .force("collide", d3.forceCollide(5))
							.stop();

		for (var i = 0; i < 200; ++i) simulation.tick();

		// draw names
		const tooltip = d3.select("#tooltip");
		const axis = svg.append("g").attr("class", "axis");

		svg
			.append("g")
			.selectAll(".pokemon")
			.data(source)
				.enter()
			.append("circle")
				.attr("class", "pokemon")
				.attr("r", (d) => scaleRadius(+d.power))
				.attr("cx", (d) => d.x)
				.attr("cy", (d) => d.y)
				.style("fill", (d) => getColor(d.type1))
			.on("mouseover", (d) => {
				const color1 = scaleColor(types.indexOf(d.type1));
				const color2 = scaleColor(types.indexOf(d.type2));

				tooltip.html(`<h2>${d.name}</h2>
								(<span style="color:${color1}">
									${d.type1}</span>
									${d.type2.length ? 
										`/ <span style="color:${color2}">${d.type2}</span>` 
										: ""}
								)<br/>
								<b>attack</b> ${d.attack}<br/>
								<b>defense</b> ${d.defense}<br/>
								<b>speed</b> ${d.speed}`);
				tooltip.style("display", "block")
					.style("left", (d3.event.pageX) + "px")		
                	.style("top", (d3.event.pageY - 30) + "px");	
			})
			.on("mouseout", (d) => {
				tooltip.style("display", "none");
			});
		
		// draw axis 
		const axisData = Object.values(triangle);
		axis
			.selectAll(".label")
			.data(axisData).enter()
			.append("text")
				.text((d) => d.title)
				.attr("transform", (d) => `translate(${scaleCoord(d.x)},${scaleCoord(d.y)})`)
				.attr("dy", (d) => d.y > 0.5 ? 15: -10);

		const triangleLine = d3.line()
						.x((d) => scaleCoord(d.x))
						.y((d) => scaleCoord(d.y))
						.curve(d3.curveLinearClosed);

		axis
			.append("path")
			.datum(axisData)
			.attr("d", triangleLine)
			.style("fill", "none")
			.style("stroke", "#aaa");

		// draw legend

		const scalePos = d3.scalePoint()
							.domain(types)
							.range([0, 250]);
		const legend = svg.append("g")
						.attr("class", "legend")
						.attr("transform", "translate(280,-270)");

		legend
			.append("text")
			.attr("transform", "translate(30, 150)rotate(90)")
			.attr("class", "header")
			.text("Pokemon types");

		const elements = legend
			.selectAll(".type")
				.data(types).enter()
			.append("g")
			.attr("transform", (d) => `translate(0,${scalePos(d)})`);

		elements
			.append("text")
			.text(d => d);

		elements
			.append("circle")
			.attr("r", 5)
			.attr("cx", 15)
			.attr("cy", -5)
			.style("fill", (d) => getColor(d));


		var notes = svg.append("g")
					.attr("class", "notes")
					.attr("transform","translate(-350, -300)");

		notes
			.append("text")
			.attr("class", "header")
			.text("Visualize All 802 Pokemons");

		notes
			.selectAll(".items")
			.data([
					"Balanced diagram of basic attributes",
					"over Pokemon types.",
					"",
					"Compare speed/attack/defense",
					"and see types prefered",
					"attribute.",
					"",
					"Hover for more",
					"information."
				]).enter()
			.append("text")
			.text(d => d)
			.attr("transform", (d, i) => `translate(0, ${(i + 2)*25})`);

  });		