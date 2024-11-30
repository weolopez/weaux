// deno-lint-ignore-file no-explicit-any
import { dumpDatabase, getDb } from "../utils/db.ts";

export async function dbview() {
  const db = await getDb("cache");
  const css = `<style>
    li {
        list-style-type: none;
        margin-bottom: 1rem;
    }
    button {
        background-color: #f00;
        color: #fff;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }
    button:hover {
        background-color: #f55;
    }
    button:active {
        background-color: #f00;
    }
</style>`;
  const dbArray = await dumpDatabase();
  let dbList = dbArray.map((item: { db: any; key: any }) =>
    `<li>
            <span class="item-key">${item.key}</span>
            <span class="item-details" style="display: none;">
                <hr> ${item.db}
                <button onclick="deleteItem('${item.key}')">Delete</button>
                <hr>
            </span>
    </li>`
  ).join("");

  const script = `<script>
    document.querySelectorAll('.item-key').forEach(key => {
        key.addEventListener('mouseover', () => {
            key.nextElementSibling.style.display = 'inline';
        });
        key.addEventListener('mouseout', () => {
            key.nextElementSibling.style.display = 'none';
        });
    });
</script>`;

  let view = `${css}<ul>${dbList}</ul>${script}`;
  return view;
}
