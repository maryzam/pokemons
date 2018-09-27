d3.csv("pokemons_trio.csv")
  .then((source) => {
  		// prepare container
		const width = 700;
		const aspectRatio = 2 / Math.sqrt(3);
		const height = width / aspectRatio;

		const types = [	"bug",
						"dark",
						"dragon",
						"electric",
						"fairy",
						"fighting",
						"fire",
						"flying",
						"ghost",
						"grass",
						"ground",
						"ice",
						"normal",
						"poison",
						"psychic",
						"rock",
						"steel",
						"water" ];

		const scaleColor =d3.scaleSequential(d3.interpolateRainbow)
    						.domain([0, types.length]);

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
		const minRatio = 0.25;
		const coeff = 1 / (1 - minRatio);
		const calcX = (speed, attack, defense)  => {

			const x = attack * triangle.attack.x + 
					  speed * triangle.speed.x +
					  defense * triangle.defense.x;
			return coeff * scaleCoord(x);
		};

		const calcY = (speed, attack, defense) => {

			const y = attack * triangle.attack.y + 
					  speed * triangle.speed.y +
					  defense * triangle.defense.y;
			return coeff * scaleCoord(y);
		};

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
				.attr("cx", (d) => calcX(+d.speed_b, +d.attack_b, +d.defense_b))
				.attr("cy", (d) => calcY(+d.speed_b, +d.attack_b, +d.defense_b))
				.style("fill", (d) => scaleColor(types.indexOf(d.type1)))
			.on("mouseover", (d) => {
				tooltip.html(`${d.name}<br/>${d.type1}`);
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
				.attr("dy", (d) => d.y > 0.5 ? 10: -5);

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

  });		