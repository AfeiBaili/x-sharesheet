import Dropdown from './dropdown';
import {h} from './element';
import {baseFormats, formatm} from '../core/format';
import {cssPrefix} from '../config';

export default class DropdownFormat extends Dropdown {
	constructor() {
		let nformats = baseFormats.slice(0);
		nformats.splice(2, 0, {key: 'divider'});
		nformats.splice(8, 0, {key: 'divider'});
		nformats = nformats.map((it) => {
			const item = h('div', `${cssPrefix}-item`);
			if (it.key === 'divider') {
				item.addClass('divider');
			} else {
				item.child(it.title())
					.on('click', () => {
						this.setTitle(it.title());
						this.change(it);
					}).attr("key", it.key);
				if (it.label) item.child(h('div', 'label').html(it.label));
			}
			return item;
		});
		super('Normal', '220px', true, 'bottom-left', ...nformats);
	}

	setTitle(key) {
		for (let i = 0; i < baseFormats.length; i += 1) {
			if (baseFormats[i].key === key) {
				this.title.html(baseFormats[i].title());
			}
		}
		this.hide();
	}

	show() {
		super.show();
		this.el.lastElementChild.childNodes.forEach(item => {
			const attr = item.getAttribute('key');
			if (attr !== null) {
				const lastChild = item.lastChild
				const length = item.childNodes.length;
				item.innerText = formatm[attr].title()
				if (length === 2) {
					item.appendChild(lastChild)
				}
			}
		})
	}
}
