// deno-lint-ignore-file no-explicit-any
import { getDB } from "../utils/db.ts";

export async function dbview() {
  const css = /*html*/ `<style>
    li {
        list-style-type: none;
        margin-bottom: 1rem;
    }
    .delete {
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
  const dbArray = await getDB();
  let dbList = dbArray.map((item: { db: any; key: any }) => /*html*/ `
    <li>
            <span class="item-key">${item.db}:${item.key}</span>
            <span class="item-details" style="display: none;">
                <hr>
                <button class="delete" onclick="deleteItem('${item.db}','${item.key}')">Delete</button>
                <hr>
            </span>
    </li>`).join("");

  const script = /*html*/ `<script>
    document.querySelectorAll('.item-key').forEach(key => {
            key.addEventListener('click', () => {
                    const details = key.nextElementSibling;
                    details.style.display = details.style.display === 'none' ? 'inline' : 'none';
            });
    });
    deleteItem = async (db, key) => {
        if (!key) key = '';
        await fetch('/db/'+db+'/' + key, { method: 'DELETE' });
        alert(key +' deleted');
        window.location.reload();
    }
</script>`;

  let view = `${css}<ul>${dbList}</ul>${script}`;
  return view;
}
